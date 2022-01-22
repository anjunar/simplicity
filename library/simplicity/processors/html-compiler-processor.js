import {evaluation} from "./js-compiler-processor.js";
import {isEqual} from "../simplicity.js";
import {attributeProcessorRegistry} from "./attribute-processors.js";
import {lifeCycle} from "./life-cycle-processor.js";

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


function findProperties(object) {
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

const proxyCache = new WeakMap();

export function membraneFactory(instance) {
    if (instance instanceof Object) {
        let cachedProxy = proxyCache.get(instance);
        if (cachedProxy) {
            return cachedProxy;
        } else {
            let proxy = new Proxy(instance, {
                has(target, p) {
                    if (p === "isProxy" || p === "resolve") {
                        return true;
                    }
                    return Reflect.has(target, p)
                },
                set(target, p, value, receiver) {
                    let properties = findProperties(target);
                    if (properties.indexOf(p) > - 1) {
                        let result = Reflect.set(target, p, value, receiver);
                        lifeCycle();
                        return result;
                    }
                    return Reflect.set(target, p, value, target);
                },
                get(target, p, receiver) {
                    if (p === "resolve") {
                        return target;
                    }

                    if (p === "isProxy") {
                        return true;
                    }

                    if (typeof p === "symbol" || p === "prototype") {
                        return Reflect.get(target, p, receiver);
                    }

                    let properties = findProperties(target);
                    if (properties.indexOf(p) > - 1) {
                        let instance = Reflect.get(target, p, receiver);
                        if (instance && instance.isProxy) {
                            return instance;
                        }
                        return membraneFactory(instance);
                    }

                    let result = Reflect.get(target, p, target);
                    if (result instanceof Function) {
                        return (...args) => result.apply(target, args);
                    }
                    return result
                }
            });

            proxyCache.set(instance, proxy);

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

    variable(name) {
        if (Reflect.has(this.instance, name)) {
            return this.instance;
        } else {
            return this.parent.variable(name);
        }
    }
}


function interpolationStatement(text, context) {
    let interpolationRegExp = /{{([^}]+)}}/g;

    function evalText() {
        return text.replace(interpolationRegExp, (match, expression) => {
            return evaluation(expression, context)
        });
    }

    function generator() {
        let expression = evalText();
        return document.createTextNode(expression);
    }

    let textNode = generator();

    return {
        type : "interpolation",
        text : text,
        build(parent) {
            parent.appendChild(textNode);
        },
        update() {
            textNode.textContent = evalText();
        }
    }
}

function htmlStatement(tagName, attributes, children) {

    let tag = tagName.split(":")
    let name = tag[0];
    let extension = tag[1]
    let element = document.createElement(name, {is : extension});

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
        type : "html",
        element : element,
        children : children,
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
                if (child instanceof Object && ! (child instanceof Function)) {
                    child.update();
                }
            }
        }
    }
}

function forExpressions(expressions) {
    let letRegex = /let\s+(\w[\w\d]+)\s+of\s+(\w[\w\d.,()\s]+)/;
    let onRenderedRegex = /onRendered\s+=\s+(\w[\w\d.]*\(\$children\))/;

    let result = {};

    let expressionList = expressions.split(";");
    for (let expression of expressionList) {
        expression = expression.trim();
        if (letRegex.test(expression)) {
            let regexResult = letRegex.exec(expression);
            let variable = regexResult[1];
            let source = regexResult[2]
            result.for = {
                expression : expression,
                variable : variable,
                source : source
            }
        }
        if (onRenderedRegex.test(expression)) {
            let regexResult = onRenderedRegex.exec(expression);
            let func = regexResult[1]
            result.onRendered = {
                expression : expression,
                func : func
            }
        }
    }

    return result;
}

function forStatement(expressions, context, callback) {

    let data = forExpressions(expressions);

    let children = [];
    let array = Array.from(evaluation(data.for.source, context));
    let ast = [];
    
    let container = document.createDocumentFragment();
    let comment = document.createComment(data.for.expression);

    function generate() {
        array.forEach((item, index) => {
            let instance = {};
            instance[data.for.variable] = item;
            instance["index"] = index;
            instance["length"] = array.length;
            let astLeaf = callback(new Context(instance, context));
            ast.push(astLeaf);
            let build = astLeaf.build(container);
            children.push(build);
        })
    }

    return {
        type : "for",
        expression : expressions,
        children : ast,
        build: function (parent) {
            generate();
            parent.appendChild(comment)
            parent.appendChild(container);
            if (data.onRendered) {
                evaluation(data.onRendered.func, context, {$children : children})
            }
            return children;
        },
        update: function () {
            let newArray = Array.from(evaluation(data.for.source, context));
            if (!isEqual(newArray, array)) {
                array = newArray;
                for (const child of children) {
                    child.remove();
                }
                children.length = 0;
                ast.length = 0;
                generate();
                comment.after(container)
                if (data.onRendered) {
                    evaluation(data.onRendered.func, context, {$children : children})
                }
            } else {
                for (const astElement of ast) {
                    astElement.update();
                }
            }
        }
    }
}

function ifStatement(boundAttributes, html) {

    let values = boundAttributes();
    let value = values.if;
    let comment = document.createComment("if");
    let container = document.createDocumentFragment();
    let element;

    function generate() {
        element = html.build(container);
    }

    return {
        type : "if",
        element : html,
        build(parent) {
            generate();
            parent.appendChild(comment);
            if (value) {
                parent.appendChild(container);
            }
        },
        update() {
            let values = boundAttributes();
            let newValue = values.if;
            if (! isEqual(newValue, value)) {
                value = newValue;
                if (value) {
                    if (! element.isConnected) {
                        comment.after(element);
                    }
                } else {
                    if (element.isConnected) {
                        element.remove();
                    }
                }
            }
            html.update();
        }
    }
}

function bindStatement(name, value, context) {
    let processor;
    return {
        type : "bind",
        name : name,
        value : value,
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
            if (processor && ! processor.runOnce) {
                processor.process();
            }
        }
    }
}

function slotStatement(boundAttributes, contents) {

    let values = boundAttributes();

    let container = document.createDocumentFragment();
    let comment = document.createComment("slot");
    let children = [];

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

    return {
        type : "slot",
        ...values,
        children : children,
        build(parent) {
            fragment = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        },
        update() {
            let newValues = boundAttributes();
            let equal = isEqual(newValues, values);
            if (! equal) {
                values = newValues;
                for (const child of children) {
                    child.remove();
                }
                children.length = 0;
                fragment = generate();
                comment.after(container);
            } else {
                fragment.update();
            }
        }
    };
}

function switchStatement(boundAttributes, children) {

    let container = document.createDocumentFragment();
    let comment = document.createComment("switch")

    function generate() {
        for (const child of children) {
            child.build(container);
        }
    }

    let element;
    let value;

    return {
        build(parent) {
            let values = boundAttributes();
            value = values.switch;
            generate();
            element = container.querySelector(`case[value=${value}]`);
            if (!element) {
                element = container.querySelector(`case[value=default]`);
            }
            parent.appendChild(comment);
            parent.appendChild(element);
        },
        update() {
            let values = boundAttributes();
            let newValue = values.switch;
            if (! isEqual(value, newValue)) {
                value = newValue;
                container.appendChild(element);
                element = container.querySelector(`case[value=${value}]`);
                if (!element) {
                    element = container.querySelector(`case[value=default]`);
                }
                comment.after(element);
            }
            for (const child of children) {
                child.update();
            }
        }
    }
}

function variableStatement(variable, context, html) {

    let element = html.element;

    evaluation(variable + " = $value", context, {$value : element})

    return html;

}

function letStatement(boundAttributes, implicit, context, callback) {
    let values = boundAttributes();
    let instance = {};
    instance[values.let] = implicit;
    let newContext = new Context(instance, context);
    return callback(newContext);
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

function boundAttributes(attributes, observed, context) {
    function values() {
        let attributeValues = {};
        for (const attribute of attributes) {
            let indexOf = attribute.indexOf("=");
            let attributePair = [attribute.substr(0, indexOf), attribute.substr(indexOf + 1)]
            if (attribute.startsWith("bind")) {
                let string = attributePair[0].split(":")[1];
                if (observed.indexOf(string) > -1) {
                    attributeValues[string] = evaluation(attributePair[1], context)
                }
            } else {
                attributeValues[attributePair[0]] = attributePair[1]
            }
        }
        return attributeValues;
    }

    return values;
}

export function codeGenerator(nodes) {
    function children(node, level) {
        if (isCompositeComponent(node)) {
            return `function(implicit) { return [${intern(node.childNodes, level)}]}`
        }
        if (node.localName === "template") {
            return intern(node.content.childNodes, level)
        }
        return intern(node.childNodes, level)
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


    function intern(nodes, level = 1) {
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
                        return `\n${tabs}interpolationStatement(\`${node.textContent}\`, context)`
                    } else {
                        return `\n${tabs}\`${node.textContent}\``
                    }
                } else {

                    let tagName = node.localName;
                    if (node.hasAttribute("is")) {
                        tagName += ":" + node.getAttribute("is")
                    }
                    if (node.hasAttribute("bind:for")) {
                        return `\n${tabs}forStatement("${node.getAttribute("bind:for")}", context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1)}\n${tabs}])})`
                    }
                    if (node.hasAttribute("bind:variable")) {
                        return `\n${tabs}variableStatement("${node.getAttribute("bind:variable")}", context, html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level)}\n${tabs}]))`
                    }

                    if (node.hasAttribute("let")) {
                        return `\n${tabs}letStatement(boundAttributes([${rawAttributes(node)}], ["let"], context), implicit, context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1)}\n${tabs}])})`
                    }
                    if (node.hasAttribute("bind:if")) {
                        return `\n${tabs}ifStatement(boundAttributes([${rawAttributes(node)}], ["if"], context), html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level)}\n${tabs}]))`
                    }
                    if (node.hasAttribute("bind:switch")) {
                        return `\n${tabs}switchStatement(boundAttributes([${rawAttributes(node)}], ["switch"], context), [${intern(node.childNodes, ++level)}\n${tabs}])`
                    }
                    if (node.localName === "slot") {
                        return `\n${tabs}slotStatement(boundAttributes([${rawAttributes(node)}], ["index", "selector", "implicit", "source"], context), content)`
                    }
                    return `\n${tabs}html("${tagName}", [${attributes(node)}], [${children(node, level + 1)}\n${tabs}])`
                }
            }).join(", ")
    }

    let expression = `function factory(context, content, implicit) { return [${intern(nodes)}\n]}`;
    let func = Function(`return function(forStatement, slotStatement, html, letStatement, interpolationStatement, bindStatement, ifStatement, variableStatement, switchStatement, boundAttributes) {return ${expression}}`);
    return func()(forStatement, slotStatement, htmlStatement, letStatement, interpolationStatement, bindStatement, ifStatement, variableStatement, switchStatement, boundAttributes)
}

export function compiler(template, instance, content, implicit) {
    let container = document.createDocumentFragment();
    let activeTemplate = template(new Context(instance), content, implicit);

    let component = new Component(activeTemplate);
    component.build(container);

    container.update = function () {
        component.update();
    }

    return container;
}