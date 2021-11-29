import {attributeProcessorRegistry} from "./processors/attribute-processors.js";
import {register} from "./services/view-manager.js";
import {TextProcessor} from "./processors/text-processor.js";
import {lifeCycle} from "./processors/life-cycle-processor.js";
import {debounce} from "./services/tools.js";
import {ComponentProcessor} from "./processors/component-processor.js";

document.system = {
    pageLoad : [],
    lifeCycle : {
        cycles : 0,
        latency : [],
        avgLatency : [],
    }
}

document.addEventListener("lifecycle", debounce((event) => {
    lifeCycle(document.body, event);
}, 30))

export function isEqual(lhs, rhs) {
    if (lhs instanceof Array && rhs instanceof Array) {
        if (lhs && rhs && lhs.length === rhs.length) {
            for (let i = 0; i < lhs.length; i++) {
                const lh = lhs[i];
                const rh = rhs[i];
                if (lh !== rh) {
                    return false;
                }
            }
            return true;
        }
        return false;
    } else {
        return lhs === rhs;
    }
}

Node.prototype.queryUpwards = function (callback) {
    if (callback(this)) {
        return this;
    } else {
        if (this.parentElement === null) {
            return null;
        }
        return this.parentElement.queryUpwards(callback);
    }
}

function createProcessors(element) {
    for (const attribute of Array.from(element.attributes)) {
        for (const AttributeProcessor of attributeProcessorRegistry) {
            if (!attribute.processor) {
                let processor = new AttributeProcessor(attribute, element);
                if (processor.matched) {
                    attribute.processor = processor;
                    element.component.attributeBindings.push(processor);
                }
            }
        }
    }

    for (const childNode of element.childNodes) {
        if (childNode.nodeType === 3) {
            let interpolationRegExp = /\${([^}]+)}/g;
            if (interpolationRegExp.test(childNode.textContent)) {
                if (!childNode.processor) {
                    let textProcessor = new TextProcessor(element, childNode);
                    childNode.processor = textProcessor;
                    element.component.textNodeProcessors.push(textProcessor);
                }
            }
        }
    }
}

const blackList = ["mousemove", "mouseover", "loadend", "lifecycle"]

let listeners = new WeakMap();

EventTarget.prototype.addEventListener = (function (_super) {
    return function (name, callback, options = {lifeCycle : true}) {
        if (name !== "") {
            let handler = (event) => {
                callback(event)
                if (blackList.indexOf(name) === -1 && options.lifeCycle) {
                    document.dispatchEvent(new CustomEvent("lifecycle", {detail : {target : event.target, event : name}}));
                }
            };
            listeners.set(callback, handler);
            _super.apply(this, [name, handler], options)
            return handler;
        }
    }
})(EventTarget.prototype.addEventListener);

EventTarget.prototype.removeEventListener = (function (_super) {
    return function (name, callback) {
        let listener = listeners.get(callback);
        _super.apply(this, [name, listener])
    }
})(EventTarget.prototype.removeEventListener)

export function findProperty(name, scope, element) {
    if (element === null) {
        throw new Error(`property: ${name} not found in template: ${scope.localName}`)
    }
    if (element.component) {
        for (const context of element.component.context) {
            switch (context) {
                case "slot" : {
                    if (element.template === scope) {
                        if (Reflect.has(element, name)) {
                            return element;
                        }
                    }
                }
                    break;
                case "repeat" : {
                    if (element.template === scope) {
                        if (Reflect.has(element, name)) {
                            return element;
                        }
                    }
                }
                    break;
                case "template" : {
                    if (element === scope) {
                        if (Reflect.has(element, name)) {
                            return element;
                        }
                    }
                }
                    break;
            }
        }
    }
    if (element.root) {
        return findProperty(name, scope, element.root)
    }
    return findProperty(name, scope, element.parentNode)
}

document.importComponent = function (node) {
    let result = document.importNode(node, true);

    function createLink(clone, original) {

        let lhsIterator = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
        let rhsIterator = document.createNodeIterator(original, NodeFilter.SHOW_ELEMENT);

        let lhsNode = lhsIterator.nextNode();
        let rhsNode = rhsIterator.nextNode();

        variableBindingExecution(lhsNode, rhsNode)

        for (const property of Object.keys(rhsNode)) {
            switch (property) {
                case "component" : {
                    lhsNode.component.context = rhsNode.component.context;
                } break
                default : {
                    lhsNode[property] = rhsNode[property];
                } break;
            }
        }

        while (lhsNode !== null && rhsNode !== null) {
            function scope(lhsNode, rhsNode) {
                Object.defineProperties(lhsNode, {
                    template: {
                        get() {
                            return rhsNode.template;
                        }
                    }
                })
            }

            scope(lhsNode, rhsNode)

            if (lhsNode instanceof HTMLTemplateElement && rhsNode instanceof HTMLTemplateElement) {
                createLink(lhsNode.content, rhsNode.content)
            }

            lhsNode = lhsIterator.nextNode();
            rhsNode = rhsIterator.nextNode();

        }

    }

    createLink(result, node);

    return result;
}

function buildContent(element) {
    let fragment = document.createDocumentFragment();
    templateBinding(fragment)
    for (const child of Array.from(element.children)) {
        fragment.root = element;
        fragment.appendChild(child);
    }
    return fragment;
}

function buildContext(root, templateElement) {
    let templateElementCloned = templateElement.cloneNode(true);

    function createLink(root, clone) {
        let iterator = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();

        while (node !== null) {
            function scope(root, lhsNode) {
                Object.defineProperties(lhsNode, {
                    template: {
                        get() {
                            return root;
                        }
                    }
                })
            }

            scope(root, node);

            if (node instanceof HTMLTemplateElement && node.hasAttribute("is")) {
                createLink(root, node.content);
            }

            node = iterator.nextNode();
        }
    }

    createLink(root, templateElementCloned.content);

    return templateElementCloned;
}

const variableBindingRegistry = new WeakMap();

function variableBindingExecution(lhsNode, rhsNode) {
    let variableBinding = variableBindingRegistry.get(rhsNode);
    if (variableBinding) {
        variableBindingRegistry.set(lhsNode, variableBinding);
        variableBinding(lhsNode);
    }
}

function variableBinding(root, template) {
    let iterator = document.createNodeIterator(template, NodeFilter.SHOW_ELEMENT);
    let node = iterator.nextNode();
    while (node !== null) {
        function scope(node) {
            for (const attribute of node.attributes) {
                if (attribute.name === "bind:variable") {
                    let variableName = attribute.value;
                    root[variableName] = node;
                    variableBindingRegistry.set(node, (node) => {
                        root[variableName] = node;
                    })
                }
            }
        }
        scope(node);
        node = iterator.nextNode();
    }
}

export function templateBinding(content) {
    let mutationObserver = new MutationObserver((records) => {
        let mutationRecord = records.find((record) => record.addedNodes.length > 0);
        if (mutationRecord) {
            for (const addedNode of mutationRecord.addedNodes) {
                if (addedNode instanceof HTMLTemplateElement && addedNode.hasAttribute("is")) {
                    let component = addedNode.queryUpwards((element) => element.localName.indexOf("-") > -1);
                    if (! component) {
                        // Call connnectedCallback because it is not triggered when placed inside a Template
                        addedNode.connectedCallback(true);
                        // Event for Dom-Slot, because the MutationObserver is async
                        content.dispatchEvent(new CustomEvent("contentChanged"))
                    }
                }
            }
        }
    })
    mutationObserver.observe(content, {subtree : true, childList : true});
}

const names = new Map();

class Component {
    context = []
    attributesChanged = false
    initialized = false
    attributeBindings = []
    textNodeProcessors = []
    addContext(value) {
        this.context.push(value);
    }
    hasContext() {
        return this.context.length > 0;
    }
}

export const customComponents = new class CustomComponents {
    define(name, clazz, options) {

        let template = clazz.template;
        let templateElement = null;
        if (template) {
            let parser = new ComponentProcessor();
            let html = parser.parse(template);
            templateElement = html.querySelector("template");
            let css = html.querySelector("style");
            if (css) {
                document.head.appendChild(css);
            }
        }

        class SimplicityComponent extends clazz {

            component = new Component();

            attributeChangedCallback(name, oldValue, newValue) {
                if (!isEqual(oldValue, newValue)) {
                    this.component.attributesChanged = true;
                    super.attributeChangedCallback(name, oldValue, newValue)
                }
            }

            connectedCallback(force = false) {
                if (super.connectedCallback) {
                    super.connectedCallback();
                }

                if (this.isConnected || force) {
                    if (! this.component.initialized) {

                        if (template) {
                            this.component.addContext("template");

                            this.content = buildContent(this);

                            if (clazz.components) {
                                checker(clazz.components, templateElement, this.localName)
                            }

                            let template = buildContext(this, templateElement);

                            variableBinding(this, template);

                            createProcessors(this);

                            this.appendChild(template.content);

                        } else {
                            createProcessors(this)
                        }

                        if (this.initialize) {
                            this.initialize();
                        }

                        this.component.attributesChanged = false;
                        this.component.initialized = true;

                        document.dispatchEvent(new CustomEvent("lifecycle", {detail : {target : this, event : "initialize"}}));
                    }
                }

            }

            disconnectedCallback() {
                if (this.component.initialized) {
                    if (super.destroy) {
                        super.destroy();
                    }
                }
            }

            static get observedAttributes() {
                if (super.observedAttributes) {
                    let observedAttributes = super.observedAttributes;
                    return observedAttributes.map((attribute => attribute.name))
                } else {
                    return [];
                }
            }

            static get observedBindAttributes() {
                if (super.observedAttributes) {
                    return super.observedAttributes;
                } else {
                    return [];
                }
            }
        }

        customElements.define(name, SimplicityComponent, options);
        names.set(SimplicityComponent, name);

        return SimplicityComponent
    }
}

export const customViews = new class CustomViews {
    define(configuration) {

        register(configuration.name, configuration)

        return customComponents.define(configuration.name, configuration.class)
    }
}

function checker(jsImports, html, path) {
    if (html) {
        let components = [];

        function traverse(elements) {
            for (const element of elements) {
                if (element.localName.indexOf("-") > -1) {
                    let name = element.localName;
                    if (components.indexOf(name) === -1) {
                        components.push(name);
                    }
                }
                if (element.hasAttribute("is")) {
                    let name = element.getAttribute("is");
                    if (! name.startsWith("native")) {
                        if (components.indexOf(name) === -1) {
                            components.push(name);
                        }
                    }
                }

                if (element instanceof HTMLTemplateElement && element.hasAttribute("is")) {
                    traverse(element.content.children)
                }

                traverse(element.children);
            }
        }

        traverse(html.content.children);

        let sortedComponents = components.sort();
        let sortedJsImports = jsImports.map(item => names.get(item)).sort();

        if (!isEqual(sortedComponents, sortedJsImports)) {
            let toMuch = sortedJsImports.filter((importz) => sortedComponents.indexOf(importz) === -1);
            let missing = sortedComponents.filter((component) => sortedJsImports.indexOf(component) === -1)

            console.log(`path: ${path} toMuch : ${toMuch.join(", ")} missing:  ${missing.join(", ")}`)
        }

    }
}