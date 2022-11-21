import {collectIdentifiers, evaluation} from "../interpreters/js-interpreter.js";
import {getPropertyDescriptor} from "../util/tools.js";
import {generate} from "../../astring/astring.js";
import {appManager} from "../manager/app-manager.js";

const data = new WeakMap();

function resolve(segments, context1) {
    if (segments.length > 1) {
        let context = context1[segments[0]];
        for (let i = 0; i < segments.length - 2; i++) {
            const segment = segments[i + 1];
            context = context[segment]
        }
        return context;
    } else {
        return context1;
    }
}

export function activeObjectExpression(expression, context, element, callback) {
    let oldValue = null;
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
            let model = resolve(segments, context);
            let lastSegment = segments[segments.length - 1];
            let descriptor = getPropertyDescriptor(model, lastSegment);
            if (descriptor.get && descriptor.set === undefined) {
                let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                let handler = () => {
                    let newValue = evaluation(expression, context, {}, false);
                    callback(newValue, oldValue);
                    oldValue = newValue;
                };
                let handlers = resonator(handler, element);

                if (activator) {
                    activator(() => {
                        let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                        let handler = () => {
                            let newValue = evaluation(expression, context, {}, false);
                            callback(newValue, oldValue);
                            oldValue = newValue;
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
                        let newValue = evaluation(expression, context, {}, false);
                        callback(newValue, oldValue);
                        oldValue = newValue;
                    }
                })
            }
            let newValue = evaluation(expression, context, {}, false);
            callback(newValue, oldValue);
            oldValue = newValue;
        }
        if (bodyElement.type === "CallExpression") {
            let {method, resonator, activator} = evaluation(identifier, context, {}, true);
            let handler = () => {
                let newValue = evaluation(expression, context);
                callback(newValue, oldValue)
                oldValue = newValue;
            };
            let handlers = resonator(handler, element);

            if (activator) {
                activator(() => {
                    let {method, resonator, activator} = evaluation(identifier, context, {}, true);
                    let handler = () => {
                        let newValue = evaluation(expression, context)
                        callback(newValue, oldValue)
                        oldValue = newValue;
                    };
                    for (const handler of handlers) {
                        Membrane.remove(handler);
                    }
                    handlers = resonator(handler, element);
                }, element)
            }

            let newValue = evaluation(expression, context);
            callback(newValue)
            oldValue = newValue;
        }
    }
}

function addEventHandler(scope) {
    let node = scope[0].proxy;
    let handlers = node.handlers;
    return function (options) {
        let name = options.property, handler = options.handler, element = options.element,
            scoped = options.scoped || false;
        let path = scope.map(object => object.property).join(".") + "." + name;

        let result = {
            node: node,
            path : path,
            handler: handler,
            element: element,
            scoped : scoped
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

export function membraneFactory(instance, parent = []) {
    if (instance instanceof Node) {
        return instance;
    }
    if (instance instanceof Object) {
        let root = parent[0].proxy;
        let path = parent.map(object => object.property).join(".");
        return new Proxy(instance, {
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
                return membraneFactory(result, [...parent, {proxy: target, property: "()"}]);
                ;
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

                if (value && value.isProxy) {
                    value = value.resolve;
                }

                let oldValue = Reflect.get(target, p, receiver);

                let result = Reflect.set(target, p, value, receiver);

                for (const eventHandler of root.handlers) {
                    if (eventHandler.scoped) {
                        if (eventHandler.path === (path + "." + p)) {
                            eventHandler.handler(value, oldValue);
                        }
                    } else {
                        if (eventHandler.path.startsWith(path + "." + p)) {
                            eventHandler.handler(value, oldValue);
                        }
                    }
                }

                console.log("latency : " + Math.round(performance.now() - start) + "ms" + " " + path + "." + p + " " + parent[0].proxy.localName)

                return result;
            },
            get(target, p, receiver) {
                if (p === "$parent") {
                    return parent
                }

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
                return membraneFactory(result, [...parent, {proxy: receiver, property: p}]);
            }
        })
    }
    return instance;
}

export function generateDomProxy(node) {
    node.handlers = node.handlers || [];
    let dataObject = data.get(node);
    if (! dataObject) {
        dataObject = {}
        data.set(node, dataObject);
    }

    function generateWrapper(construct, property, descriptor, data) {
        delete construct[property];

        Object.defineProperty(data, property, descriptor);

        Object.defineProperty(construct, property, {
            configurable: true,
            enumerable: true,
            get() {
                let instance = Reflect.get(data, property);
                if ((instance && instance.isProxy) || (instance && instance instanceof WebSocket)) {
                    return instance;
                }
                return membraneFactory(instance, [{
                    proxy: construct, property: property
                }])
            },
            set(value) {
                let start = performance.now();

                let oldValue = Reflect.get(data, property, data);

/*
                if (value && value.isProxy) {
                    value = value.resolve;
                }
*/

                Reflect.set(data, property, value)
                for (const eventHandler of node.handlers) {
                    if (eventHandler.scoped) {
                        if (eventHandler.path === property) {
                            eventHandler.handler(value, oldValue);
                        }
                    } else {
                        if (eventHandler.path.startsWith(property)) {
                            eventHandler.handler(value, oldValue);
                        }
                    }
                }

                if (appManager.mode === "development") {
                    console.log("latency : " + Math.round(performance.now() - start) + "ms" + " " + property + " " + construct.localName)
                }
            }
        })
    }

    function $fire(value) {
        for (const eventHandler of node.handlers) {
            if (eventHandler.path === value.property) {
                eventHandler.handler(value.proxy);
            }
        }
    }

    function addEventHandler (options) {
        let name = options.property, handler = options.handler, element = options.element,
            scoped = options.scoped;

        if (node[name] instanceof Object && Reflect.has(node[name], "method") && Reflect.has(node[name], "resonator")) {
            let nodeElement = node[name];
            nodeElement.resonator(() => {
                handler(nodeElement.method());
            }, element);
        } else {
            let result = {
                node : node,
                path: name,
                handler: handler,
                element: element,
                scoped : scoped
            };
            node.handlers.push(result);

            element.addEventListener("removed", () => {
                let entry = node.handlers.find((entry) => entry.path === name && entry.handler === handler);
                if (entry) {
                    let indexOf = node.handlers.indexOf(entry);
                    node.handlers.splice(indexOf, 1)
                }
            })

            return result;
        }
    }

    function removeEventHandler(options) {
        let indexOf = node.handlers.indexOf(options);
        node.handlers.splice(indexOf, 1)
    }

    function setupProxy() {
        let descriptors = Object.getOwnPropertyDescriptors(node);
        for (const [property, descriptor] of Object.entries(descriptors)) {
            let privateGetter = Object.getOwnPropertyDescriptor(dataObject, property)
            if (! privateGetter) {
                let blackList = ["$fire", "addEventHandler", "removeEventHandler", "initialized", "handlers", "content"];
                let blackListRegex = /\d+/;
                if (! blackList.includes(property) && ! blackListRegex.test(property)) {
                    generateWrapper(node, property, descriptor, dataObject);
                }
            }
        }
    }

    if (! Reflect.has(node, "$fire") && ! Reflect.has(node, "addEventHandler")) {
        Object.defineProperties(node, {
            $fire : {
                set(value) {
                    $fire(value)
                }
            },
            addEventHandler : {
                value : addEventHandler
            },
            removeEventHandler : {
                value : removeEventHandler
            }
        })
    }

    setupProxy();
}

export const Membrane = class Membrane {
    static track(membrane, options) {
        return membrane.addEventHandler(options);
    }
    static remove(options) {
        options.node.removeEventHandler(options);
    }
    static fire(membrane) {
        membrane.fire();
    }
}