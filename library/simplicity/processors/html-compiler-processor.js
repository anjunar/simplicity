import {
    astGenerator,
    codeGenerator as jsCodeGenerator,
    collectIdentifiers,
    evaluation,
    identifierToArray
} from "./js-compiler-processor.js";
import {attributeProcessorRegistry} from "./attribute-processors.js";
import {cachingProxy, evaluator, isEqual} from "../services/tools.js";
import {appManager} from "../manager/app-manager.js";

export const contentRegistry = new WeakMap();

class Component {

    ast;

    constructor(ast) {
        this.ast = ast;
    }

    build(container) {
        for (const segment of this.ast) {
            segment.build(container);
        }
    }

    update() {
        for (const segment of this.ast) {
            segment.update();
        }
    }
}

export function content(element, implicit = "undefined") {
    let func = contentRegistry.get(element);
    let objects = func(implicit);
    let fragment = document.createDocumentFragment();

    let component = new Component(objects);
    component.build(fragment);

    fragment.update = function () {
        component.update();
    }

    return fragment;
}

const findProperties = cachingProxy(function (object) {
        let cursor = object;

        let result = [];
        while (cursor !== null) {
            let ownPropertyNames = Object.getOwnPropertyNames(cursor);
            result.push(...ownPropertyNames);
            cursor = Object.getPrototypeOf(cursor);
            if (cursor && cursor.constructor.name.startsWith("HTML")) {
                cursor = null
            }
        }
        return result;
    }
)

export function activeObjectExpression(expression, context, element, callback) {
    let identifiers = collectIdentifiers(expression);
    for (let identifier of identifiers) {
        let ast = astGenerator(identifier);
        let bodyElement = ast.body[0];

        if (bodyElement.type === "Identifier") {
            let segments = identifierToArray(bodyElement);
            let model = context.resolve(segments);
            let lastSegment = segments[segments.length - 1];
            model.addEventHandler(lastSegment, element, () => {
                callback(evaluation(expression, context));
            });
        }
        if (bodyElement.type === "CallExpression") {
            let {method, resonator} = evaluation(identifier, context, {}, true);
            let handler = () => { callback(evaluation(expression, context))};
            resonator(handler, element);
        }
    }
}

let lifeCycles = 0;
let avgLatency = 0;

function addEventHandler(handlers) {
    return function (name, element, handler) {
        handlers.push({
            name : name,
            handler : handler,
            element : element
        });

        element.addEventListener("removed", () => {
            let entry = handlers.find((entry) => entry.name === name && entry.handler === handler);
            let indexOf = handlers.indexOf(entry);
            handlers.splice(indexOf, 1)
        })
    }
}

const membraneCache = new WeakMap();

export function membraneFactory(instance, $parent, property) {
    if (instance instanceof Object) {
        let cachedProxy = membraneCache.get(instance);
        if (cachedProxy) {
            return cachedProxy;
        } else {
            let eventHandlers = [];
            let proxy = new Proxy(instance, {
                apply(target, thisArg, argArray) {
                    if (thisArg instanceof DocumentFragment) {
                        return Reflect.apply(target, thisArg.resolve, argArray);
                    }
                    let result = Reflect.apply(target, thisArg, argArray);
                    if (thisArg instanceof Array && (target.name === "push" || target.name === "splice")) {
                        if ($parent.$parent) {
                            $parent.$parent.$fire = {
                                proxy: thisArg,
                                property: thisArg.$property
                            }
                        }
                    }
                    return result;
                },
                has(target, p) {
                    if (p === "isProxy" || p === "resolve") {
                        return true;
                    }
                    return Reflect.has(target, p);
                },
                set(target, p, value, receiver) {
                    let decimalRegex = /\d+/
                    if (decimalRegex.test(p) && target instanceof Array) {
                        let result = Reflect.set(target, p, value, receiver);
                        if ($parent) {
                            $parent.$fire = {
                                proxy : receiver,
                                property: receiver.$property
                            }
                        }
                        return result;
                    }

                    if (p === "$fire") {
                        for (const eventHandler of eventHandlers) {
                            if (eventHandler.name === value.property) {
                                eventHandler.handler(value.proxy);
                            }
                        }
                        return true;
                    }

                    let properties = findProperties(target);
                    if (properties.indexOf(p) > -1) {
                        let result = Reflect.set(target, p, value, receiver);

                        let timeStart = performance.now();

                        for (const eventHandler of eventHandlers) {
                            if (eventHandler.name === p) {
                                eventHandler.handler(value);
                            }
                        }

                        let timeEnd = performance.now();
                        let delta = timeEnd - timeStart;
                        avgLatency = (avgLatency + delta);
                        console.log(`Latency ${Math.round(delta)} ms - avg Latency: ${Math.round(avgLatency / lifeCycles)} ms`);

                        let lifeCycle = appManager.performance.lifeCycle;

                        lifeCycle.cycles = lifeCycles;
                        lifeCycle.addAvgLatency(avgLatency / lifeCycles)
                        lifeCycle.addLatency(delta);

                        lifeCycles++;

                        return result;
                    }
                    return Reflect.set(target, p, value, target);
                },
                get(target, p, receiver) {
                    if (p === "$property") {
                        return property;
                    }

                    if (p === "$parent") {
                        return $parent;
                    }

                    if (p === "resolve") {
                        return target;
                    }

                    if (p === "isProxy") {
                        return true;
                    }

                    if (p === "addEventHandler") {
                        return addEventHandler(eventHandlers);
                    }

                    if (typeof p === "symbol" || p === "prototype") {
                        return Reflect.get(target, p, receiver);
                    }

                    let properties = findProperties(target);
                    if (properties.indexOf(p) > -1 || target instanceof Array) {
                        let instance = Reflect.get(target, p, receiver);
                        if (instance && instance.isProxy) {
                            return instance;
                        }
                        return membraneFactory(instance, receiver, p);
                    }

                    let result = Reflect.get(target, p, target);
                    if (result instanceof Function) {
                        return (...args) => result.apply(target, args);
                    }
                    return result
                }
            });

            membraneCache.set(instance, proxy);

            return proxy
        }
    }
    return instance;
}

export class Context {

    instance;
    parent;

    constructor(instance, parent) {
        this.instance = membraneFactory(instance);
        this.parent = parent;
    }

    resolve(segments) {
        if (segments.length > 1) {
            let context = this.variable(segments[0]);
            for (let i = 0; i < segments.length - 1; i++) {
                const segment = segments[i];
                context = context[segment]
            }
            return context;
        } else {
            return this.variable(segments);
        }
    }

    variable(name) {
        if (Reflect.has(this.instance, name)) {
            return this.instance;
        } else {
            if (this.parent) {
                return this.parent.variable(name);
            }
            return null;
        }
    }
}


function notifyElementRemove(element) {
    let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ALL)
    let node = iterator.nextNode();
    while (node !== null) {
        node.dispatchEvent(new CustomEvent("removed"))
        node = iterator.nextNode();
    }
}


function interpolationStatement(text, context, shadow) {
    let interpolationRegExp = /{{([^}]+)}}/g;

    function evalText() {
        return text.replace(interpolationRegExp, (match, expression) => {
            let result = evaluation(expression, context);
            if (result === undefined || result === null) {
                return ""
            }
            return result;
        });
    }

    let textNode = document.createTextNode("");

    if (!shadow) {
        text.replace(interpolationRegExp, (match, expression) => {
            activeObjectExpression(expression, context, textNode, () => {
                let textContent = evalText();
                if (textContent !== textNode.textContent) {
                    textNode.textContent = textContent;
                }
            })
        })
    }

    function generator() {
        textNode.textContent = evalText();
        return textNode;
    }

    return {
        type: "interpolation",
        text: text,
        build(parent) {
            textNode = generator();
            parent.appendChild(textNode);
        },
        update() {
            let textContent = evalText();
            if (textContent !== textNode.textContent) {
                textNode.textContent = textContent;
            }
        }
    }
}

function htmlStatement(tagName, attributes, children) {

    let tag = tagName.split(":")
    let name = tag[0];
    let extension = tag[1]
    let element = document.createElement(name, {is: extension});

    function generate() {
        for (const child of children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else {
                if (child instanceof Function) {
                    contentRegistry.set(element, child);
                } else {
                    if (element instanceof HTMLTemplateElement) {
                        child.build(element.content)
                    } else {
                        child.build(element)
                    }

                }
            }
        }

        for (const attribute of attributes) {
            if (typeof attribute === "string") {
                let indexOf = attribute.indexOf("=");
                let segments = [attribute.substr(0, indexOf), attribute.substr(indexOf + 1)]
                element.setAttribute(segments[0], segments[1])
            } else {
                attribute.build(element);
            }
        }

        return element;
    }

    return {
        type: "html",
        element: element,
        children: children,
        build(parent) {
            generate();
            parent.appendChild(element);
            return element;
        },
        update() {
            for (const attribute of attributes) {
                if (attribute instanceof Object) {
                    attribute.update();
                }
            }
            for (const child of children) {
                if (child instanceof Object && !(child instanceof Function)) {
                    child.update();
                }
            }
        }
    }
}

function svgStatement(tagName, attributes, children) {

    let element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

    function generate() {
        for (const child of children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else {
                if (child instanceof Function) {
                    contentRegistry.set(element, child);
                } else {
                    if (element instanceof HTMLTemplateElement) {
                        child.build(element.content)
                    } else {
                        child.build(element)
                    }

                }
            }
        }

        for (const attribute of attributes) {
            if (typeof attribute === "string") {
                let indexOf = attribute.indexOf("=");
                let segments = [attribute.substr(0, indexOf), attribute.substr(indexOf + 1)]
                element.setAttribute(segments[0], segments[1])
            } else {
                attribute.build(element);
            }
        }

        return element;
    }

    return {
        type: "svg",
        element: element,
        children: children,
        build(parent) {
            generate();
            parent.appendChild(element);
            return element;
        },
        update() {
            for (const attribute of attributes) {
                if (attribute instanceof Object) {
                    attribute.update();
                }
            }
            for (const child of children) {
                if (child instanceof Object && !(child instanceof Function)) {
                    child.update();
                }
            }
        }
    }
}


function forExpressions(expressions) {
    let ast = astGenerator(expressions);

    let result = {};

    for (const expression of ast.body) {
        if (expression.type === "VariableDeclaration") {
            if (expression.id.value === "index") {
                result.index = {
                    expression: jsCodeGenerator(expression, true),
                    variable: expression.init.value
                }
            } else if (expression.id.value === "length") {
                result.length = {
                    expression: jsCodeGenerator(expression, true),
                    variable: expression.init.value
                }
            } else if (expression.id.type === "ArrayPattern") {
                result.for = {
                    expression: jsCodeGenerator(expression, true),
                    variable: expression.id.elements.map(element => element.value),
                    source: jsCodeGenerator(expression.init, true)
                }
            } else {
                result.for = {
                    expression: jsCodeGenerator(expression, true),
                    variable: expression.id.value,
                    source: jsCodeGenerator(expression.init, true)
                }
            }
        }
        if (expression.type === "AssignmentExpression" && expression.left.value === "onRendered") {
            result.onRendered = {
                expression: jsCodeGenerator(expression, true),
                func: jsCodeGenerator(expression.right, true)
            }
        }
        if (expression.type === "AssignmentExpression" && expression.left.value === "force") {
            result.force = {
                expression: jsCodeGenerator(expression, true),
                enabled: true
            }
        }
    }

    return result;
}

function forStatement(rawAttributes, context, callback) {

    let attribute = rawAttributes.find((attribute) => attribute.startsWith("bind:for"))
    let indexOf = attribute.indexOf("=");
    let expressions = attribute.substr(indexOf + 1)

    let data = forExpressions(expressions);

    let children = [];
    let result = evaluation(data.for.source, context);
    let array;
    if (result instanceof Array) {
        array = Array.from(result);
    } else if (result instanceof Object) {
        if (data.for.variable instanceof Array) {
            array = Object.entries(result);
        } else {
            array = Object.values(result);
        }
    } else {
        console.log(`For loops data source is a ${typeof result} from path ${data.for.source}`)
    }

    let ast = [];

    let container = document.createDocumentFragment();
    let comment = document.createComment(data.for.expression);

    activeObjectExpression(data.for.source, context, comment, (result) => {
        update(result)
    });

    function generate() {
        array.forEach((item, index) => {
            let instance = {};
            if (data.for.variable instanceof Array) {
                let [key, value] = item;
                instance[data.for.variable[0]] = key;
                instance[data.for.variable[1]] = value;
            } else {
                instance[data.for.variable] = item;
            }
            if (data.index) {
                instance[data.index.variable] = index;
            }
            if (data.length) {
                instance[data.length.variable] = array.length;
            }
            let newContext = new Context(instance, context);
            let astLeaf = callback(newContext);
            ast.push(astLeaf);
            let build = astLeaf.build(container);
            children.push(build);
            newContext.instance = membraneFactory(build);
            Object.assign(build, instance)
        })

        comment.children = children;

    }

    function update(value) {
        array = value;
        for (const child of children) {
            notifyElementRemove(child);
            child.remove();
        }
        children.length = 0;
        ast.length = 0;
        generate();
        comment.after(container)
        if (data.onRendered) {
            evaluation(data.onRendered.func, context, {$children: children}, true)
        }
    }

    return {
        type: "for",
        expression: expressions,
        children: ast,
        build: function (parent) {
            generate();
            parent.appendChild(comment)
            parent.appendChild(container);
            if (data.onRendered) {
                evaluation(data.onRendered.func, context, {$children: children}, true)
            }
            return children;
        },
        update: function () {
            let result = evaluation(data.for.source, context);
            let newArray;
            if (result instanceof Array) {
                newArray = Array.from(result);
            } else if (result instanceof Object) {
                if (data.for.variable instanceof Array) {
                    newArray = Object.entries(result);
                } else {
                    newArray = Object.values(result);
                }
            } else {
                console.log(`For loops data source is a ${typeof result} from path ${data.for.source}`)
            }

            if (!isEqual(newArray, array) || data.force?.enabled) {
                array = newArray;
                update(array);
            } else {
                for (const astElement of ast) {
                    astElement.update();
                }
            }
        }
    }
}

function ifStatement(rawAttributes, context, html) {
    let attributes = getAttributes(rawAttributes, ["if"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction()
    let value = values.if;
    let comment = document.createComment("if");
    let container = document.createDocumentFragment();
    let element;

    activeObjectExpression(attributes.if.value, context, comment, () => {
        let values = boundAttributesFunction()
        update(values.if)
    })

    function update(value) {
        if (value) {
            if (element) {
                if (!element.isConnected) {
                    comment.after(element);
                }
            } else {
                generate();
                comment.after(element);
            }
        } else {
            if (element.isConnected) {
                element.remove();
            }
        }
    }

    function generate() {
        element = html.build(container);
    }

    return {
        type: "if",
        element: html,
        build(parent) {
            parent.appendChild(comment);
            if (value) {
                generate();
                parent.appendChild(container);
            }
        },
        update() {
            let values = boundAttributesFunction()
            let newValue = values.if;
            if (!isEqual(newValue, value)) {
                value = newValue;
                update(value)
            }
            if (newValue) {
                html.update();
            }
        }
    }
}

function bindStatement(name, value, context) {
    let processor;
    return {
        type: "bind",
        name: name,
        value: value,
        build(element) {
            for (const AttributeProcessor of attributeProcessorRegistry) {
                processor = new AttributeProcessor(name, value, element, context);
                if (processor.matched) {
                    break;
                } else {
                    processor = null
                }
            }
        },
        update() {
            if (processor && !processor.runOnce) {
                processor.process();
            }
        }
    }
}

function slotStatement(rawAttributes, context, contents) {
    let attributes = getAttributes(rawAttributes, ["name", "index", "source", "selector", "implicit"])
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction()

    let container = document.createDocumentFragment();
    let data = "slot " + JSON.stringify(values);

    let comment = document.createComment(data);
    let children = [];

    for (const attribute of Object.values(attributes)) {
        if (attribute.type === "bind") {
            activeObjectExpression(attribute.value, context, comment, () => {
                values = boundAttributesFunction();
                update();
            })
        }
    }

    function generate() {
        let activeContent;
        let index = values.index || 0;

        let implicitValue = values.implicit;
        if (Reflect.has(values, "source")) {
            activeContent = content(values.source.resolve, implicitValue);
        } else {
            activeContent = contents(implicitValue);
        }

        if (values.name) {
            let querySelector = activeContent.querySelectorAll(`[slot=${values.name}]`)[index];
            if (querySelector) {
                container.appendChild(querySelector)
                children.push(querySelector);
            }
        } else if (values.selector) {
            let querySelector = activeContent.querySelectorAll(values.selector)[index];
            if (querySelector) {
                container.appendChild(querySelector)
                children.push(querySelector);
            }
        } else {
            for (const segment of activeContent.children) {
                container.appendChild(segment)
                children.push(segment);
            }
        }

        return activeContent;
    }

    let fragment;

    function update() {
        for (const child of children) {
            child.remove();
        }
        children.length = 0;
        fragment = generate();
        comment.after(container);
    }

    return {
        type: "slot",
        ...values,
        children: children,
        build(parent) {
            fragment = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        },
        update() {
            let newValues = boundAttributesFunction();
            let equal = isEqual(newValues, values);
            if (!equal) {
                values = newValues;
                update();
            } else {
                fragment.update();
            }
        }
    };
}

function switchStatement(rawAttributes, context, cases) {
    let attributes = getAttributes(rawAttributes, ["switch"])
    let boundAttributesFunction = boundAttributes(attributes, context);

    let container = document.createDocumentFragment();
    let comment = document.createComment("switch")

    function generate() {
        return caseSegment.build(container);
    }

    function findCase(value) {
        for (const caseSegment of cases) {
            if (caseSegment.value === value) {
                return caseSegment;
            }
        }
        for (const caseSegment of cases) {
            if (caseSegment.value === "default") {
                return caseSegment;
            }
        }
    }

    let caseSegment;
    let value;
    let elements;

    return {
        build(parent) {
            let values = boundAttributesFunction();
            value = values.switch;
            caseSegment = findCase(value);
            elements = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        },
        update() {
            let values = boundAttributesFunction();
            let newValue = values.switch;
            if (!isEqual(value, newValue)) {
                value = newValue;
                for (const element of elements) {
                    element.remove();
                }
                caseSegment = findCase(value);
                elements = generate();
                comment.after(container);
            } else {
                caseSegment.update();
            }
        }
    }
}

function caseStatement(rawAttributes, context, children) {
    let attributes = getAttributes(rawAttributes, ["value"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction();

    return {
        type: "case",
        value: values.value,
        build(parent) {
            let elements = [];
            for (const child of children) {
                elements.push(child.build(parent));
            }
            return elements;
        },
        update() {
            for (const child of children) {
                child.update();
            }
        }
    }
}

function variableStatement(rawAttributes, context, html) {

    let attribute = rawAttributes.find((attribute) => attribute.startsWith("bind:variable"))

    let variable = attribute.split("=")[1];

    let element = html.element;

    evaluation(variable + " = $value", context, {$value: element})

    return html;

}

function letStatement(rawAttributes, implicit, context, callback) {
    let attributes = getAttributes(rawAttributes, ["let"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction();
    let instance = {};
    instance[values.let] = implicit;
    let newContext = new Context(instance, context);
    let ast = callback(newContext);
    return {
        build(parent) {
            let element = ast.build(parent);
            newContext.instance = element;
            Object.assign(element, instance)
            return element
        },
        update() {
            ast.update();
        }
    }
}

function isCompositeComponent(node) {
    if (node.localName.indexOf("-") > -1) {
        let component = customElements.get(node.localName);
        if (Reflect.has(component, "template")) {
            return true;
        }
    }
    if (node.hasAttribute("is")) {
        let component = customElements.get(node.getAttribute("is"));
        if (Reflect.has(component, "template")) {
            return true;
        }
    }
    return false;
}

function getAttributes(attributes, observed) {
    let attributeValues = {};
    for (const attribute of attributes) {
        let indexOf = attribute.indexOf("=");
        let attributePair = [attribute.substr(0, indexOf), attribute.substr(indexOf + 1)]
        if (attribute.startsWith("bind")) {
            let string = attributePair[0].split(":")[1];
            if (observed.indexOf(string) > -1) {
                attributeValues[string] = {
                    name: string,
                    type: "bind",
                    value: attributePair[1]
                }
            }
        } else {
            attributeValues[attributePair[0]] = {
                name: attributePair[0],
                type: "raw",
                value: attributePair[1]
            }
        }
    }
    return attributeValues;
}

function boundAttributes(attributes, context) {
    function values() {
        let attributeValues = {};
        for (let attribute of Object.values(attributes)) {
            if (attribute.type === "bind") {
                attributeValues[attribute.name] = evaluation(attribute.value, context)
            } else {
                attributeValues[attribute.name] = attribute.value
            }
        }
        return attributeValues;
    }

    return values;
}

export function codeGenerator(nodes) {
    function children(node, level, isSvg = false, shadow) {
        if (isCompositeComponent(node)) {
            shadow = true;
            return `function(implicit) { let shadow=${shadow}; return [${intern(node.childNodes, level, isSvg, shadow)}]}`
        }
        if (node.localName === "template") {
            return intern(node.content.childNodes, level, isSvg, shadow)
        }
        return intern(node.childNodes, level, isSvg, shadow)
    }

    function rawAttributes(node) {
        return Array.from(node.attributes).map((attribute) => `"${attribute.name}=${attribute.value}"`);
    }

    function attributes(node) {
        return Array.from(node.attributes)
            .filter((attribute) => attribute.name !== "bind:if" && attribute.name !== "bind:for" && attribute.name !== "bind:variable" && attribute.name !== "bind:switch")
            .map((attribute => {
                if (attribute.name.startsWith("bind") || attribute.name === "i18n") {
                    return `bindStatement("${attribute.name}", "${attribute.value}", context)`
                }
                return `"${attribute.name}=${attribute.value}"`
            })).join(",")
    }


    function intern(nodes, level = 1, isSvg = false, shadow) {
        let tabs = "\t".repeat(level);
        return Array.from(nodes)
            .filter((node => (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) || node.nodeType === Node.ELEMENT_NODE))
            .map((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    let interpolationRegExp = /{{([^}]+)}}/g;

                    if (node.parentElement instanceof HTMLIFrameElement) {
                        return `\n${tabs}\`${node.textContent}\``
                    }
                    if (interpolationRegExp.test(node.textContent)) {
                        if (!(node.parentElement instanceof HTMLScriptElement)) {
                            return `\n${tabs}interpolationStatement(\`${node.textContent}\`, context, shadow)`
                        }
                        return `\n${tabs}\`${node.textContent}\``
                    } else {
                        return `\n${tabs}\`${node.textContent}\``
                    }
                } else {

                    let tagName = node.localName;
                    if (node.hasAttribute("is")) {
                        tagName += ":" + node.getAttribute("is")
                    }
                    if (node.hasAttribute("bind:for")) {
                        return `\n${tabs}forStatement([${rawAttributes(node)}], context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg, shadow)}\n${tabs}])})`
                    }
                    if (node.hasAttribute("let")) {
                        return `\n${tabs}letStatement([${rawAttributes(node)}], implicit, context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg, shadow)}\n${tabs}])})`
                    }
                    if (node.hasAttribute("bind:variable")) {
                        return `\n${tabs}variableStatement([${rawAttributes(node)}], context, html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level, isSvg, shadow)}\n${tabs}]))`
                    }
                    if (node.hasAttribute("bind:if")) {
                        return `\n${tabs}ifStatement([${rawAttributes(node)}], context, html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level, isSvg, shadow)}\n${tabs}]))`
                    }
                    if (node.hasAttribute("bind:switch")) {
                        return `\n${tabs}switchStatement([${rawAttributes(node)}], context, [${intern(node.childNodes, ++level, isSvg, shadow)}\n${tabs}])`;
                    }
                    if (node.localName === "case") {
                        return `\n${tabs}caseStatement([${rawAttributes(node)}], context, [${intern(node.childNodes, ++level, isSvg, shadow)}\n${tabs}])`;
                    }
                    if (node.localName === "slot") {
                        return `\n${tabs}slotStatement([${rawAttributes(node)}], context, content)`;
                    }
                    if (node.localName === "svg" || isSvg) {
                        return `\n${tabs}svg("${tagName}", [${attributes(node)}], [${children(node, level + 1, true, shadow)}\n${tabs}])`
                    }
                    return `\n${tabs}html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg, shadow)}\n${tabs}])`
                }
            }).join(", ")
    }

    let expression = `function factory(context, content, implicit) { let shadow = false; return [${intern(nodes)}\n]}`;
    let arg = `return function(forStatement, slotStatement, html, svg, letStatement, interpolationStatement, bindStatement, ifStatement, variableStatement, switchStatement, caseStatement) {return ${expression}}`;
    let func = evaluator(arg)
    return func()(forStatement, slotStatement, htmlStatement, svgStatement, letStatement, interpolationStatement, bindStatement, ifStatement, variableStatement, switchStatement, caseStatement)
}

export function compiler(template, instance, content, implicit) {
    let container = document.createDocumentFragment();
    let activeTemplate = template(new Context(instance, new Context(window)), content, implicit);

    let component = new Component(activeTemplate);
    component.build(container);

    container.update = function () {
        component.update();
    }

    return container;
}