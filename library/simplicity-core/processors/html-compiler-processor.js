import {collectIdentifiers, evaluation} from "./js-compiler-processor.js";
import {attributeProcessorRegistry} from "./attribute-processors.js";
import {evaluator, getPropertyDescriptor, Membrane} from "../services/tools.js";
import {attributes, buildStrategie, isCompositeComponent} from "../plugins/helper.js";
import {generate} from "./js-compiler-extension.js";
import {appManager} from "../manager/app-manager.js";

const pluginRegistry = [];
export const contentRegistry = new WeakMap();
const membraneCache = new WeakMap();

export const customPlugins = new class CustomPlugins {

    define(configuration) {
        pluginRegistry.push(configuration);
        return configuration;
    }

    find(name, destination) {
        return pluginRegistry.find(plugin => plugin.name.indexOf(name) > -1 && plugin.destination === destination)
    }

    names() {
        let names = [];
        for (const plugin of pluginRegistry) {
            for (const name of plugin.name) {
                if (name.startsWith("bind")) {
                    names.push(name)
                }
            }
        }
        return names
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
}

let contentChildrenCache = new WeakMap();

export function content(element, implicit) {
    function generate() {
        let func = contentRegistry.get(element);
        let objects = func(implicit);
        let fragment = document.createDocumentFragment();

        let component = new Component(objects);
        component.build(fragment);

        fragment.component = component;
        return fragment;
    }

    let contentChildren = contentChildrenCache.get(element);

    if (contentChildren) {
        let implicitObject = contentChildren.get(implicit);
        if (implicitObject) {
            return implicitObject;
        } else {
            let fragment = generate();

            implicitObject = implicit;
            contentChildren.set(implicitObject, fragment)

            return fragment;
        }
    } else {
        let fragment = generate();

        let implicitObject = new Map();
        implicitObject.set(implicit, fragment)
        contentChildrenCache.set(element, implicitObject)

        return fragment;
    }
}

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
            let descriptor = getPropertyDescriptor(model, lastSegment);
            if (descriptor.get && descriptor.set === undefined) {
                let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                let handler = () => {
                    callback(evaluation(expression, context));
                };
                let handlers = resonator(handler, element);

                if (activator) {
                    activator(() => {
                        let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                        let handler = () => {
                            callback(evaluation(expression, context));
                        };
                        for (const handler of handlers) {
                            Membrane.remove(handler);
                        }
                        handlers = resonator(handler, element);
                    }, element)
                }
            } else {
                Membrane.track(model, {
                    property : lastSegment,
                    element : element,
                    handler : () => {
                        callback(evaluation(expression, context));
                    }
                })
            }
        }
        if (bodyElement.type === "CallExpression") {
            let {method, resonator, activator} = evaluation(identifier, context, {}, true);
            let handler = () => {
                callback(evaluation(expression, context))
            };
            let handlers = resonator(handler, element);

            if (activator) {
                activator(() => {
                    let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                    let handler = () => {
                        callback(evaluation(expression, context));
                    };
                    for (const handler of handlers) {
                        Membrane.remove(handler);
                    }
                    handlers = resonator(handler, element);
                }, element)
            }
        }
    }
}

function addEventHandler(scope) {
    let node = scope[0].proxy;
    let handlers = node.handlers;
    return function (options) {
        let name = options.property, handler = options.handler, element = options.element,
            scoped = options.scoped || false, passive = options.passive || false, override = options.override || false;
        let path = scope.map(object => object.property).join(".") + "." + name;

        let result = {
            node: node,
            path : path,
            handler: handler,
            element: element,
            scoped : scoped,
            passive : passive,
            override : override
        };
        handlers.push(result);

        element.addEventListener("removed", () => {
            let entry = handlers.find((entry) => entry.path === path && entry.handler === handler);
            if (entry) {
                let indexOf = handlers.indexOf(entry);
                handlers.splice(indexOf, 1)
            }
        })
        return result;
    }
}

function removeEventHandler(scope) {
    let node = scope[0].proxy;
    let handlers = node.handlers;
    return function (options) {
        let indexOf = handlers.indexOf(options);
        handlers.splice(indexOf, 1)
    }
}

function fire(handlers, path) {
    return function () {
        for (const handler of handlers) {
            if (handler.path.startsWith(path)) {
                handler.handler();
            }
        }
    }
}

function passiveProperty(passive, path) {
    return function () {
        passive.push(path);
    }
}

export function membraneFactory(instance, parent = []) {
    if (instance instanceof Node) {
        return instance;
    }
    if (instance instanceof Object) {
        let root = parent[0].proxy;
        let path = parent.map(object => object.property).join(".");
        let proxy = new Proxy(instance, {
            apply(target, thisArg, argArray) {
                if (thisArg instanceof DocumentFragment || thisArg instanceof Promise) {
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
                if (thisArg instanceof Array && target.name === "find") {
                    return Reflect.apply(target, thisArg, argArray);
                }
                return membraneFactory(result, [...parent, {proxy : target, property : "()"}]);;
            },
            has(target, p) {
                if (p === "isProxy" || p === "resolve") {
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

                let start = performance.now();

                if (value.isProxy) {
                    value = value.resolve;
                }

                let result = Reflect.set(target, p, value, receiver);

                for (const eventHandler of root.handlers) {
                    if (eventHandler.scoped) {
                        if (eventHandler.path === (path + "." + p) && (root.passive.indexOf(path + "." + p) === -1 || eventHandler.override)) {
                            eventHandler.handler(value);
                        }
                    } else {
                        if (eventHandler.path.startsWith(path + "." + p) && (root.passive.indexOf(path + "." + p) === -1 || eventHandler.override)) {
                            eventHandler.handler(value);
                        }
                    }
                }

                if (appManager.mode === "development") {
                    console.log("latency : " + Math.round(performance.now() - start) + "ms")
                }

                return result;
            },
            get(target, p, receiver) {
                if (p === "resolve") {
                    if (target.isProxy) {
                        return target.resolve;
                    }
                    return target;
                }

                if (p === "isProxy") {
                    return true;
                }

                if (p === "addEventHandler") {
                    return addEventHandler(parent);
                }

                if (p === "removeEventHandler") {
                    return removeEventHandler(parent)
                }

                if (p === "fire") {
                    return fire(root.handlers, path);
                }

                if (p === "passiveProperty") {
                    return passiveProperty(root.passive, path + "." + p)
                }

                if (typeof p === "symbol" || p === "prototype") {
                    return Reflect.get(target, p, receiver);
                }

                if (target instanceof WebSocket) {
                    return Reflect.get(target, p, receiver);
                }

                let result = Reflect.get(target, p, receiver);
                if (result && result.isProxy) {
                    return result;
                }
                return membraneFactory(result, [...parent, {proxy : receiver, property : p}]);
            }
        });

        membraneCache.set(instance, proxy);

        return proxy
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

function passiveInterpolationStatement(text, context) {
    let interpolationRegExp = /{{{([^}]+)}}}/g;

    let textNode = document.createTextNode("");
    textNode.textContent = evalText();

    function evalText() {
        return text.replace(interpolationRegExp, (match, expression) => {
            let result = evaluation(expression, context, null, true);
            if (result === undefined || result === null) {
                return ""
            }
            return result;
        });
    }

    return {
        type: "interpolation",
        text: text,
        build(parent) {
            parent.appendChild(textNode);
        },
        import(parent) {
            return passiveInterpolationStatement(text, context)
                .build(parent)
        }
    }
}

function interpolationStatement(text, context) {
    let interpolationRegExp = /{{([^}]+)}}/g;

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

    function evalText() {
        return text.replace(interpolationRegExp, (match, expression) => {
            let result = evaluation(expression, context);
            if (result === undefined || result === null) {
                return ""
            }
            return result;
        });
    }

    return {
        type: "interpolation",
        text: text,
        build(parent) {
            parent.appendChild(textNode);
        },
        import(parent) {
            return interpolationStatement(text, context)
                .build(parent)
        }
    }
}

function htmlStatement(tagName, attributes, children, app, imported = false) {

    let tag = tagName.split(":")
    let name = tag[0];
    let extension = tag[1];
    let element = document.createElement(name, {is: extension});
    element.app = app;

    function generate() {
        for (const child of children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else {
                if (child instanceof Function) {
                    contentRegistry.set(element, child);
                } else {
                    if (element instanceof HTMLTemplateElement) {
                        buildStrategie(child, element.content, imported)
                    } else {
                        buildStrategie(child, element, imported)
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
                buildStrategie(attribute, element, imported)
            }
        }

        return element;
    }

    return {
        type: "html",
        children: children,
        element : element,
        build(parent) {
            generate();
            parent.appendChild(element);
            return element;
        },
        import(parent) {
            return htmlStatement(tagName, attributes, children, app, true)
                .build(parent)
        }
    }
}

function svgStatement(tagName, attributes, children, app, imported = false) {

    let element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    element.app = app;

    function generate() {
        for (const child of children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else {
                if (child instanceof Function) {
                    contentRegistry.set(element, child);
                } else {
                    if (element instanceof HTMLTemplateElement) {
                        buildStrategie(child, element.content, imported)
                    } else {
                        buildStrategie(child, element, imported)
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
                buildStrategie(attribute, element, imported)
            }
        }

        return element;
    }

    return {
        type: "svg",
        children: children,
        element : element,
        build(parent) {
            generate();
            parent.appendChild(element);
            return element;
        },
        import(parent) {
            return svgStatement(tagName, attributes, children, app, true)
                .build(parent)
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
        import(element) {
            return bindStatement(name, value, context)
                .build(element)
        }
    }
}

function bindOnceStatement(name, value, context) {
    let processor;
    return {
        type: "bind",
        name: name,
        value: value,
        build(element) {
            for (const AttributeProcessor of attributeProcessorRegistry) {
                processor = new AttributeProcessor(name, value, element, context, true);
                if (processor.matched) {
                    break;
                } else {
                    processor = null
                }
            }
        },
        import(element) {
            return bindOnceStatement(name, value, context)
                .build(element)
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
                    let passiveInterpolationRegExp = /{{{([^}]+)}}}/g;
                    let interpolationRegExp = /{{([^}]+)}}/g;
                    let textContent = node.textContent
                        .replaceAll("`", "\\`")
                        .replaceAll("${", "\\${")

                    if (node.parentElement instanceof HTMLIFrameElement) {
                        return `\n${tabs}\`${textContent}\``
                    }
                    if (passiveInterpolationRegExp.test(textContent)) {
                        if (!(node.parentElement instanceof HTMLScriptElement)) {
                            return `\n${tabs}passiveInterpolationStatement(\`${textContent}\`, context)`
                        }
                        return `\n${tabs}\`${textContent}\``
                    } else {
                        if (interpolationRegExp.test(textContent)) {
                            if (!(node.parentElement instanceof HTMLScriptElement)) {
                                return `\n${tabs}interpolationStatement(\`${textContent}\`, context)`
                            }
                            return `\n${tabs}\`${textContent}\``
                        } else {
                            return `\n${tabs}\`${textContent}\``
                        }
                    }
                } else {

                    let tagName = node.localName;
                    if (node.hasAttribute("is")) {
                        tagName += ":" + node.getAttribute("is");
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
                        return `\n${tabs}svg("${tagName}", [${attributes(node)}], [${children(node, level + 1, true)}\n${tabs}], app)`
                    }
                    return `\n${tabs}html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg)}\n${tabs}], app)`
                }
            }).join(", ")
    }

    let expression = `function factory(context, content, implicit, app) { return [${intern(nodes)}\n]}`;
    let names = customPlugins.executors().map(executor => executor.name);
    let arg = `return function(${names.join(", ")}, html, svg, interpolationStatement, passiveInterpolationStatement, bindStatement, bindOnceStatement) {return ${expression}}`;
    let func = evaluator(arg)
    let parameters = [...customPlugins.executors(), htmlStatement, svgStatement, interpolationStatement, passiveInterpolationStatement, bindStatement, bindOnceStatement];
    return func().apply(this, parameters)
}

export function compiler(template, instance, content, implicit, app) {
    let container = document.createDocumentFragment();
    let activeTemplate = template(new Context(instance, new Context(window)), content, implicit, app);

    let component = new Component(activeTemplate);
    component.build(container);

    container.component = component;

    return container;
}