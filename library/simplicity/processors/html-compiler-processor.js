import {collectIdentifiers, evaluation} from "./js-compiler-processor.js";
import {attributeProcessorRegistry} from "./attribute-processors.js";
import {cachingProxy, evaluator, getPropertyDescriptor} from "../services/tools.js";
import {generate} from "../../astring";
import {attributes, isCompositeComponent} from "../plugins/helper.js";

const pluginRegistry = [];
export const contentRegistry = new WeakMap();
const membraneCache = new WeakMap();

export const customPlugins = new class CustomPlugins {

    define(configuration) {
        pluginRegistry.push(configuration);
        return configuration;
    }

    find(name, destination) {
        return pluginRegistry.find(plugin => plugin.name === name && plugin.destination === destination)
    }

    executors() {
        return pluginRegistry.map(plugin => plugin.executor);
    }

}

class Component {

    ast;

    constructor(ast) {
        this.ast = ast;
    }

    build(container) {
        for (const segment of this.ast) {
            if (segment instanceof Object) {
                segment.build(container);
            }
        }
    }

    update() {
        for (const segment of this.ast) {
            if (segment instanceof Object) {
                segment.update();
            }
        }
    }
}

export function content(element, implicit) {
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
    for (let ast of identifiers) {
        let identifier = generate(ast);
        let bodyElement = ast;

        if (bodyElement.type === "Identifier" || bodyElement.type === "MemberExpression") {
            function identifierToArray(node) {
                if (node.type === "Identifier") {
                    return [node.name]
                }
                if (node.type === "MemberExpression") {
                    return [...identifierToArray(node.object), node.property.name]
                }
            }

            let segments = identifierToArray(bodyElement);
            let model = context.resolve(segments);
            let lastSegment = segments[segments.length - 1];
            let descriptor = getPropertyDescriptor(lastSegment, model);
            if (descriptor.get && descriptor.set === undefined) {
                let {method, resonator} = evaluation(identifier, context, {}, true);
                let handler = () => {
                    callback(evaluation(expression, context));
                };
                resonator(handler, element);
            } else {
                model.addEventHandler(lastSegment, element, () => {
                    callback(evaluation(expression, context));
                });
            }
        }
        if (bodyElement.type === "CallExpression") {
            let {method, resonator} = evaluation(identifier, context, {}, true);
            let handler = () => {
                callback(evaluation(expression, context))
            };
            resonator(handler, element);
        }
    }
}

function addEventHandler(scope) {
    let handlers = scope[0].proxy.handlers;
    return function (name, element, handler) {
        let path = scope.map(object => object.property).join(".") + "." + name;

        handlers.push({
            path : path,
            handler: handler,
            element: element
        });

        if (handlers.filter(item => item.name === name).length > 50) {
            console.warn(`possibly handlers memory leak ${handlers.length} ${name}`)
        }

        element.addEventListener("removed", () => {
            let entry = handlers.find((entry) => entry.path === path && entry.handler === handler);
            if (entry) {
                let indexOf = handlers.indexOf(entry);
                handlers.splice(indexOf, 1)
            }
        })
    }
}

export function membraneFactory(instance, parent = []) {
    if (instance instanceof Node) {
        return instance;
    }
    if (instance instanceof Object) {
        let cachedProxy = membraneCache.get(instance);
        if (cachedProxy) {
            return cachedProxy;
        } else {
            let root = parent[0].proxy;
            let path = parent.map(object => object.property).join(".");
            let proxy = new Proxy(instance, {
                apply(target, thisArg, argArray) {
                    if (thisArg instanceof DocumentFragment) {
                        return Reflect.apply(target, thisArg.resolve, argArray);
                    }
                    let result = Reflect.apply(target, thisArg, argArray);
                    if (thisArg instanceof Array && (target.name === "push" || target.name === "splice")) {
                        if (parent.length > 0) {
                            let element = parent[0];
                            element.proxy.$fire = {
                                proxy: thisArg,
                                property: element.property
                            }
                        }
                    }
                    return result;
                },
                has(target, p) {
                    if (p === "isProxy" || p === "resolve" || p === "scope") {
                        return true;
                    }
                    return Reflect.has(target, p);
                },
                set(target, p, value, receiver) {
                    let decimalRegex = /\d+/
                    if (target instanceof Array && decimalRegex.test(p)) {
                        let result = Reflect.set(target, p, value, receiver);
                        if (parent.length > 0) {
                            let element = parent[parent.length - 1];
                            element.proxy.$fire = {
                                proxy: receiver,
                                property: element.property
                            }
                        }
                        return result;
                    }

                    if (p === "$fire") {
                        for (const eventHandler of root.handlers) {
                            if (path + "." + p === eventHandler.path) {
                                eventHandler.handler(value.proxy);
                            }
                        }
                        return true;
                    }

                    let properties = findProperties(target);
                    if (properties.indexOf(p) > -1) {
                        let result = Reflect.set(target, p, value, receiver);

                        for (const eventHandler of root.handlers) {
                            if (eventHandler.path.startsWith(path + "." + p)) {
                                eventHandler.handler(value);
                            }
                        }

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

                    if (p === "addEventHandler") {
                        return addEventHandler(parent);
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
                        return membraneFactory(instance, [...parent, {proxy : receiver, property : p}]);
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
        this.instance = instance;
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


function interpolationStatement(text, context) {
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
    textNode.textContent = evalText();

    text.replace(interpolationRegExp, (match, expression) => {
        activeObjectExpression(expression, context, textNode, () => {
            let textContent = evalText();
            if (textContent !== textNode.textContent) {
                textNode.textContent = textContent;
            }
        })
    })

    return {
        type: "interpolation",
        text: text,
        build(parent) {
            parent.appendChild(textNode);
        },
        update() {}
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
            if (Reflect.has(element, "render")) {
                element.render();
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
            if (processor) {
                processor.process();
            }
        }
    }
}

export function codeGenerator(nodes) {
    function children(node, level, isSvg = false) {
        if (isCompositeComponent(node)) {
            return `function(implicit) { return [${intern(node.childNodes, level, isSvg)}]}`
        }
        if (node.localName === "template") {
            return intern(node.content.childNodes, level, isSvg)
        }
        return intern(node.childNodes, level, isSvg)
    }

    function intern(nodes, level = 1, isSvg = false) {
        let tabs = "\t".repeat(level);
        return Array.from(nodes)
            .filter((node => (node.nodeType === Node.TEXT_NODE) || node.nodeType === Node.ELEMENT_NODE))
            .map((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    let interpolationRegExp = /{{([^}]+)}}/g;

                    if (node.parentElement instanceof HTMLIFrameElement) {
                        return `\n${tabs}\`${node.textContent}\``
                    }
                    if (interpolationRegExp.test(node.textContent)) {
                        if (!(node.parentElement instanceof HTMLScriptElement)) {
                            return `\n${tabs}interpolationStatement(\`${node.textContent}\`, context)`
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

                    for (const attribute of node.attributes) {
                        let plugin = customPlugins.find(attribute.name, "Attribute");
                        if (plugin) {
                            return plugin.code(tagName, node, children, intern, isSvg, tabs, level);
                        }
                    }

                    let plugin = customPlugins.find(node.localName, "Element");
                    if (plugin) {
                        return plugin.code(tagName, node, children, intern, isSvg, tabs, level);
                    }

                    if (node.localName === "svg" || isSvg) {
                        return `\n${tabs}svg("${tagName}", [${attributes(node)}], [${children(node, level + 1, true)}\n${tabs}])`
                    }
                    return `\n${tabs}html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg)}\n${tabs}])`
                }
            }).join(", ")
    }

    let expression = `function factory(context, content, implicit) { return [${intern(nodes)}\n]}`;
    let names = customPlugins.executors().map(executor => executor.name);
    let arg = `return function(${names.join(", ")}, html, svg, interpolationStatement, bindStatement) {return ${expression}}`;
    let func = evaluator(arg)
    let parameters = [...customPlugins.executors(), htmlStatement, svgStatement, interpolationStatement, bindStatement];
    return func().apply(this, parameters)
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