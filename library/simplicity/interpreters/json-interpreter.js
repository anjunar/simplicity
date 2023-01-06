import {activeObjectExpression, membraneFactory} from "../service/membrane.js";
import {evaluation} from "./js-interpreter.js";
import {getPropertyDescriptor, isEqual, notifyElementRemove, toKebabCase} from "../util/tools.js";

let contentCache = new WeakMap();

export function bind(context, expression) {
    return {
        type: "binding",
        expression: expression,
        context : context
    }
}

export function slot(context, options) {
    return {
        type : "slot",
        context,
        ...options
    }
}

export function letStatement(implicit, context, property, callback) {
    return {
        type: "letStatement",
        callback: callback,
        implicit: implicit,
        context : context,
        property: property
    }
}

export function forEach(context, options) {
    return {
        type : "forEach",
        context,
        ...options
    }
}

export function variable(value, context, node) {
    return {
        type : "variable",
        value,
        context,
        node
    }
}

export function interpolation(context, expression) {
    return {
        type : "interpolation",
        expression : expression,
        context : context
    }
}

function bindingFactory(node, activeElement, rework, generate) {
    if (node?.type === "interpolation") {
        let interpolationRegExp = /{{([^}]+)}}/g;

        node.expression.replace(interpolationRegExp, (match, expression) => {
            activeObjectExpression(expression, node.context, activeElement, () => {
                let textContent = evalText();
                if (textContent !== activeElement.textContent) {
                    generate(textContent);
                }
            })
        })

        function evalText() {
            return node.expression.replace(interpolationRegExp, (match, expression) => {
                let result = evaluation(expression, node.context);
                if (result === undefined || result === null) {
                    return ""
                }
                return result;
            });
        }

        generate(evalText());
    } else {
        if (node?.type === "binding") {
            function expressionCallback() {
                activeObjectExpression(node.expression, node.context, activeElement, (newValue, oldValue) => {
                    generate(newValue, oldValue);
                })
            }
            try {
                expressionCallback();
            } catch (e) {
                rework.push(expressionCallback);
            }
        } else {
            function simpleCallback() {
                if (node instanceof Function) {
                    generate(node());
                } else {
                    generate(node);
                }
            }
            try {
                simpleCallback();
            } catch (e) {
                rework.push(simpleCallback);
            }
        }
    }
}

function processLastAttributes(node, element, key, value, rework) {
    if (node.type === "svg") {
        element.setAttribute(key, value)
    } else {
        if (Reflect.has(element, key)) {
            bindingFactory(value, element, rework, function (newValue) {
                element[key] = newValue;
            })
        } else {
            element.setAttribute(key, value)
        }
    }
}

function processAttributes(node, element, rework, context) {
    if (Reflect.has(node, "attributes") && node.attributes instanceof Object) {
        for (const [key, value] of Object.entries(node.attributes)) {
            let router = {
                style() {
                    for (const [styleName, styleValue] of Object.entries(value)) {
                        bindingFactory(styleValue, element, rework, function (newValue) {
                            element.style[styleName] = newValue;
                        })
                    }
                },

                class() {
                    for (const item of value) {
                        bindingFactory(item, element, rework, function (newValue, oldValue) {
                            if (oldValue) {
                                for (const value of oldValue.split(" ")) {
                                    element.classList.remove(value);
                                }
                            }
                            if (newValue) {
                                for (const value of newValue.split(" ")) {
                                    element.classList.add(value);
                                }
                            }
                        })
                    }
                },

                i18n() {
                    let {method, resonator} = value.context.i18n(element.innerHTML);
                    resonator(() => {
                        element.innerHTML = method();
                    }, element);

                    element.innerHTML = method();
                }
            }

            if (key.startsWith("on")) {
                element.addEventListener(key.substring(2), value)
            } else {
                if (Reflect.has(router, key)) {
                    router[key]();
                } else {
                    let observedAttributes = element.constructor["observedBindAttributes"];
                    if (observedAttributes?.length > 0) {
                        let attribute = observedAttributes.find(attribute => attribute.name === key);
                        if (attribute) {
                            if (attribute.binding === "two-way" && value.expression) {
                                element.addEventListener(key, (event) => {
                                    let $value = event.target[key]
                                    let expression = value.expression + " = " + "$value"
                                    evaluation(expression, value.context, {$value: $value}, true)
                                })
                            }
                            bindingFactory(value, element, rework, function (newValue, oldValue) {
                                element.attributeChangedCallback(key, oldValue, newValue)
                            })
                        } else {
                            processLastAttributes(node, element, key, value, rework);
                        }
                    } else {
                        processLastAttributes(node, element, key, value, rework);
                    }
                }
            }
        }
    }
}

function getContent(root, implicit, contentFunction, context, rework) {
    let elementContext = context.$scope[0]
    let elementContent = contentCache.get(elementContext);
    let key = "undefined";
    if (implicit !== undefined && implicit !== null) {
        key = implicit.resolve || implicit;
    }
    if (implicit === undefined) {
        implicit = "undefined";
    }
    if (elementContent) {
        let test = Array.from(elementContent.keys()).find((element) => (isEqual(element, key)));
        let entry;
        if (test) {
            entry = elementContent.get(test)
        }
        if (entry) {
            let {factory, content, mapping} = entry;
            contentFunction(factory, content, mapping);
        } else {
            let factory = context.content(implicit);
            let mapping = new Map();
            let content = processJsonAST(root, factory, context, rework, mapping);
            elementContent.set(key, {factory, content, mapping});
            contentFunction(factory, content, mapping);
        }
    } else {
        elementContent = new Map();
        contentCache.set(elementContext, elementContent);
        let factory = context.content(key);
        let mapping = new Map();
        let content = processJsonAST(root, factory, context, rework, mapping);
        elementContent.set(key, {factory, content, mapping});
        contentFunction(factory, content, mapping);
    }
}

function processJsonAST(root, nodes, context, rework = [], mapping = new Map()) {
    let elements = document.createDocumentFragment();
    for (const node of nodes) {
        let router = {
            element() {
                let element = document.createElement(node.tag);
                elements.appendChild(element)
                mapping.set(element, node);
                if (Reflect.has(node, "children")) {
                    if (node.children instanceof Array) {
                        let documentFragment = processJsonAST(root, node.children, context, rework, mapping);
                        element.appendChild(documentFragment);
                    }
                }
                processAttributes(node, element, rework, context);
            },
            svg() {
                let element = document.createElementNS("http://www.w3.org/2000/svg", node.tag);
                elements.appendChild(element)
                mapping.set(element, node);
                if (Reflect.has(node, "children")) {
                    if (node.children instanceof Array) {
                        let documentFragment = processJsonAST(root, node.children, context, rework, mapping);
                        element.appendChild(documentFragment);
                    }
                }
                processAttributes(node, element, rework, context);
            },
            dom() {
                let element = node.dom;
                elements.appendChild(element);
            },
            template() {
                let element = document.createElement("template");
                elements.appendChild(element)
                mapping.set(element, node);
                if (Reflect.has(node, "content")) {
                    if (node.content instanceof Array) {
                        let documentFragment = processJsonAST(root, node.content, context, rework, mapping);
                        element.content.appendChild(documentFragment);
                    }
                }
                processAttributes(node, element, rework, context);
            },
            component() {
                let constructor = customElements.get(node.is || node.tag);
                let element = new constructor({content : node.content, app : root.app, implicit : node.implicit});
                processAttributes(node, element, rework, context);
                element.render();
                mapping.set(element, node);
                elements.appendChild(element);
            },

            directive() {
                let constructor = customElements.get(node.is || node.tag);
                let element = new constructor({app : root.app});
                processAttributes(node, element, rework, context);
                element.render();
                mapping.set(element, node);
                elements.appendChild(element);
                if (Reflect.has(node, "children")) {
                    if (node.children instanceof Array) {
                        let documentFragment = processJsonAST(root, node.children, context, rework, mapping);
                        element.appendChild(documentFragment);
                    }
                }
            },

            text() {
                let textNode = document.createTextNode("");
                elements.appendChild(textNode);

                function generate(value) {
                    textNode.textContent = value;
                }

                bindingFactory(node.textContent, textNode, rework, generate)
            },

            slot() {
                let renderedElements = [];

                let data = "slot:";

                if (node.index) {
                    data += " index:" + node.index + " "
                }
                if (node.selector) {
                    data += " selector:" + node.selector + " "
                }
                if (node.tag) {
                    data += " tag:" + node.tag + " "
                }
                if (node.name) {
                    data += " name:" + node.name + " "
                }
                if (node.source) {
                    data += " source:" + node.source + " "
                }

                let placeholder = document.createComment(data);
                elements.appendChild(placeholder);

                let oldIndex = 0;

                function generate(implicit, index = 0, selector, tag, name, source) {
                    function content(jsonAST, documentFragment, mapping) {
                        for (const child of renderedElements) {
                            child.remove();
                            notifyElementRemove(child);
                        }

                        renderedElements = [];

                        let query;
                        if (selector) {
                            query = documentFragment.querySelectorAllBreadthFirst(node.selector)[index];
                        }

                        if (name) {
                            query = documentFragment.querySelectorAllBreadthFirst(`[slot=${node.name}]`)[index]
                        }

                        if (tag) {
                            let nodes = [];
                            let iterator = document.createNodeIterator(documentFragment, NodeFilter.SHOW_ELEMENT)
                            let cursor = iterator.nextNode();
                            while (cursor != null) {
                                if (cursor[node.tag]) {
                                    nodes.push(cursor);
                                }
                                cursor = iterator.nextNode();
                            }
                            query = nodes[index];
                        }

                        if (selector || name || tag) {
                            if (query) {
                                let ast = mapping.get(query);
                                let fragment = processJsonAST(root, [ast], context, rework, mapping);
                                for (const child of fragment.children) {
                                    renderedElements.push(child);
                                }
                                placeholder.after(fragment);
                            }
                        } else {
                            let fragment = processJsonAST(root, jsonAST, context, rework, mapping);
                            for (const child of fragment.children) {
                                renderedElements.push(child);
                            }
                            placeholder.after(fragment);
                        }
                    }

                    getContent(root, implicit, content, source || node.context, rework);

                    oldIndex = index;
                }

                let results = {}
                for (const [key, value] of Object.entries(node)) {
                    bindingFactory(value, placeholder, rework,(value) => {
                        results[key] = value
                        if (Object.keys(results).length === Object.keys(node).length) {
                            let source = results.source;
                            if (source) {
                                source = proxyFactory({$scope : [source]})
                            }
                            generate(results.implicit || value.implicit, results.index, results.selector, results.tag, results.name, source);
                        }
                    })
                }

            },
            letStatement() {
                if (node.implicit) {

                    let newContext = {
                        [node.property]: node.implicit
                    }

                    let scope = {proxy : {handlers : [], property : ""}};
                    newContext = membraneFactory(newContext, [scope])

                    newContext = proxyFactory({$scope : [...node.context.$scope, newContext]});

                    let ast = node.callback(newContext);
                    let documentFragment = processJsonAST(root, [ast], newContext, rework, mapping);
                    for (const child of documentFragment.children) {
                        mapping.set(child, ast);
                    }
                    elements.appendChild(documentFragment)
                }
            },
            forEach() {
                let activeElement = document.createComment(`for: items:${node.items.expression} item:${node.item}`);
                elements.appendChild(activeElement);
                let renderedElements = [];

                function generate(value) {
                    for (const items of renderedElements) {
                        notifyElementRemove(items);
                        items.remove();
                    }

                    renderedElements = [];

                    let documentFragment = document.createDocumentFragment();

                    let items;

                    if (node.item instanceof Array) {
                        items = Object.entries(value);
                    } else {
                        items = value;
                    }

                    items.forEach((item, index, array) => {
                        let newContext;
                        if (node.item instanceof Array) {
                            let [key, value] = item;
                            newContext = {
                                [node.item[0]]: key,
                                [node.item[1]]: value,
                            };
                        } else {
                            newContext = {
                                [node.item]: item
                            };
                        }


                        if (node.index) {
                            newContext[node.index] = index;
                        }
                        if (node.length) {
                            newContext[node.length] = array.length;
                        }

                        let scope = {proxy : {handlers : [], property : ""}};
                        newContext = membraneFactory(newContext, [scope])

                        newContext = proxyFactory({$scope : [...node.context.$scope, newContext]});

                        let ast = node.callback(newContext);

                        let fragment = processJsonAST(root, [ast], newContext, rework, mapping);
                        for (const child of fragment.childNodes) {
                            mapping.set(child, ast)
                            renderedElements.push(child);
                        }
                        documentFragment.appendChild(fragment);
                    })

                    if (node.onRendered) {
                        evaluation(node.onRendered, context, {$children : renderedElements}, true)
                    }

                    activeElement.after(documentFragment);
                }

                bindingFactory(node.items, activeElement, rework, generate);
            },

            if() {
                let data = `if:`;
                if (node.predicate?.expression) {
                    data += `predicate: ${node.predicate.expression}`
                }
                let activeElement = document.createComment(data);
                elements.appendChild(activeElement);
                let renderedElements = [];
                function generate(newValue, oldValue) {
                    if (newValue) {
                        if (renderedElements.length === 0) {
                            let ast = node.callback();
                            let fragment = processJsonAST(root, [ast], context, rework, mapping);
                            renderedElements.push(...Array.from(fragment.children));
                            activeElement.after(fragment);
                        }
                    } else {
                        for (const element of renderedElements) {
                            notifyElementRemove(element);
                            element.remove();
                        }
                        renderedElements.length = 0;
                    }
                }

                bindingFactory(node.predicate, activeElement, rework, generate)
            },

            switch() {
                let activeElement = document.createComment("switch");
                elements.appendChild(activeElement);
                let renderedElements = [];

                function generate(newValue) {
                    for (const renderedElement of renderedElements) {
                        notifyElementRemove(renderedElement);
                        renderedElement.remove();
                    }
                    let caseItem = node.cases.find((caseItem) => caseItem.value === newValue || caseItem.value === "default");
                    if (caseItem) {
                        let ast = caseItem.callback();
                        let fragment = processJsonAST(root, [ast], context, rework, mapping);
                        renderedElements.push(...Array.from(fragment.children))
                        activeElement.after(fragment)
                    } else {
                        throw new Error("case with value: " + newValue + " not found.")
                    }
                }

                bindingFactory(node.value, activeElement, rework, generate);
            },

            variable() {

                let fragment = processJsonAST(root, [node.node], context, rework, mapping);

                let element = fragment.children.item(0);

                evaluation(node.value + " = $value", node.context, {$value: element})

                elements.appendChild(fragment);
            },

            comment() {

            }
        }

        if (Reflect.has(router, node.type)) {
            router[node.type]();
        } else {
            throw new Error("unknown type: " + node.type)
        }
    }
    return elements;
}

export function proxyFactory(context) {
    let proxy = proxyCache.get(context);

    if (!proxy) {
        proxy = new Proxy(context, {
            getOwnPropertyDescriptor(target, p) {
                for (const scope of context.$scope.reverse()) {
                    let descriptor = getPropertyDescriptor(scope, p);
                    if (descriptor) {
                        return descriptor;
                    }
                }
                return null;
            },
            get(target, p, receiver) {
                if (p === "$scope") {
                    return Reflect.get(target, p, target);
                }

                for (let i = context.$scope.length - 1; i > -1 ; i--) {
                    const scope = context.$scope[i];
                    let has = Reflect.has(scope, p);
                    if (has) {
                        let result = Reflect.get(scope, p, scope);
                        if (result instanceof Function) {
                            return (...args) => result.apply(scope, args);
                        }
                        return result;
                    }
                }
                return null;
            },
            set(target, p, value, receiver) {
                for (let i = context.$scope.length - 1; i > -1 ; i--) {
                    const scope = context.$scope[i];
                    let has = Reflect.has(scope, p);
                    if (has) {
                        return Reflect.set(scope, p, value, scope);
                    }
                }

                return null;
            }
        });

        proxyCache.set(context, proxy);
    }

    return proxy;
}

const proxyCache = new WeakMap();


export function compileHTML(root, ast, context) {
    let rework = [];
    let fragment = processJsonAST(root, ast, context, rework);
    for (const callback of rework) {
        try {
            callback();
        } catch (e) {
            console.log("Rework error " + callback.toString())
        }

    }return fragment;
}

export function contentChildren(node) {
    let result;
    getContent(node, null, (jsonAST, documentFragment, mapping) => {
        result = documentFragment;
    }, proxyFactory({$scope : [node]}), []);
    return result;
}

function cssNodeToString(node, indent = 0) {
    return Object.entries(node).map(([selector, block]) => {
        if (selector.startsWith("@import")) {
            return "@import '" + block + "';";
        }

        if (selector.startsWith("@media")) {
            return `${selector} {\n${cssNodeToString(block,  1)}\n}`
        }

        if (selector.startsWith("@keyframes")) {
            return `${selector} {\n${cssNodeToString(block, 1)}\n}`
        }

        return `${"\t".repeat(indent)}${selector} {\n${Object.entries(block).map(([name, value]) => `${"\t".repeat(indent + 1)}${toKebabCase(name)} : ${value}`).join(";\n")}\n${"\t".repeat(indent)}}`
    }).join("\n\n")
}

export function compileCss(factory, context) {
    let node = factory(context);
    return cssNodeToString(node);
}