import {attributeProcessorRegistry} from "./processors/attribute-processors.js";
import {register} from "./manager/view-manager.js";
import {TextProcessor} from "./processors/text-processor.js";
import {lifeCycle} from "./processors/life-cycle-processor.js";
import {appManager} from "./manager/app-manager.js";
import {debounce} from "./services/tools.js";

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
            let interpolationRegExp = /\{\{([^}]+)\}\}/g;
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

function createProcessorTree(element) {
    if (element.component) {
        createProcessors(element);
    }

    let iterator = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
            if (node.localName === "code") {
                return NodeFilter.FILTER_REJECT;
            }
            if (node.isCompositeComponent) {
                return NodeFilter.FILTER_SKIP
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    let node = iterator.nextNode();

    while (node !== null) {
        createProcessors(node);
        node = iterator.nextNode();
    }
}

let mutationObserver = new MutationObserver((records) => {
    for (const record of records) {
        for (const addedNode of record.addedNodes) {
            createProcessorTree(addedNode)
        }
    }
})

mutationObserver.observe(document.body, {subtree : true, childList : true})

const blackList = ["mousemove", "mouseover", "loadend", "lifecycle", "scroll"]

let listeners = new WeakMap();

EventTarget.prototype.addEventListener = (function (_super) {
    return function (name, callback, options = {lifeCycle: true}) {
        if (name !== "") {
            let handler = (event) => {
                callback(event)
                if (blackList.indexOf(name) === -1 && options.lifeCycle) {
                    document.dispatchEvent(new CustomEvent("lifecycle", {detail: {target: event.target, event: name}}));
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

function synchronize(lhsNode, rhsNode) {
    if (!lhsNode.component) {
        lhsNode.component = new Component();
    }

    variableBindingExecution(lhsNode, rhsNode)

    for (const property of Object.keys(rhsNode)) {
        switch (property) {
            case "component" : {
                for (const contextElement of rhsNode.component.context) {
                    lhsNode.component.context.push(contextElement)
                }
            }
                break
            default : {
                lhsNode[property] = rhsNode[property];
            }
                break;
        }
    }

    lhsNode.template = rhsNode.template;
}

document.importComponent = function (node) {
    let result = document.importNode(node, true);

    function createLink(clone, original) {

        let lhsIterator = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
        let rhsIterator = document.createNodeIterator(original, NodeFilter.SHOW_ELEMENT);

        let lhsNode = lhsIterator.nextNode();
        let rhsNode = rhsIterator.nextNode();

        while (lhsNode !== null && rhsNode !== null) {

            synchronize(lhsNode, rhsNode);

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
    let mutationObserver1 = new MutationObserver((records) => {
        for (const mutationRecord of records) {
            for (const addedNode of mutationRecord.addedNodes) {
                if (addedNode.nodeType === Node.ELEMENT_NODE) {
                    let templates = [];
                    if (addedNode instanceof HTMLTemplateElement && addedNode.hasAttribute("is")) {
                        templates.push(addedNode)
                    } else {
                        templates = addedNode.querySelectorAll("template[is]");
                    }
                    for (const template of templates) {
                        let component = template.queryUpwards((element) => element.localName.indexOf("-") > -1);
                        if (!component) {
                            // Call connnectedCallback because it is not triggered when placed inside a Template
                            template.connectedCallback(true);
                            // Bind Components to the template
                            let nextElementSibling = template.nextElementSibling;
                            while (nextElementSibling) {
                                createProcessorTree(nextElementSibling)
                                nextElementSibling = nextElementSibling.nextElementSibling;
                            }
                            // Event for Dom-Slot, because the MutationObserver is async
                            fragment.dispatchEvent(new CustomEvent("contentChanged"))
                        }
                    }
                }
            }
        }
        if (element.render) {
            element.render();
        }
    })
    mutationObserver1.observe(fragment, {subtree: true, childList: true});

    for (const child of Array.from(element.children)) {
        fragment.root = element;
        fragment.appendChild(child);
    }
    
    return fragment;
}

function buildContext(root, template, clone = true) {
    let fragment;
    if (clone) {
        fragment = document.importNode(template, true)
    } else {
        fragment = template;
    }

    function createLink(root, clone) {
        let iterator = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();

        while (node !== null) {
            if (!node.component) {
                node.component = new Component();
            }

            node.template = root;

            if (node instanceof HTMLTemplateElement && node.hasAttribute("is")) {
                createLink(root, node.content);
            }

            node = iterator.nextNode();
        }
    }

    createLink(root, fragment);

    return fragment;
}

const variableBindingRegistry = new WeakMap();

function variableBindingExecution(lhsNode, rhsNode) {
    let variableBinding = variableBindingRegistry.get(rhsNode);
    if (variableBinding) {
        variableBindingRegistry.set(lhsNode, variableBinding);
        variableBinding(lhsNode);
    }
}

function variableBinding(root, fragment) {
    let iterator = document.createNodeIterator(fragment, NodeFilter.SHOW_ELEMENT);
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

}

export const customComponents = new class CustomComponents {
    define(name, clazz, options) {

        let template = clazz.template;
        let templateElement = null;
        let i18nMessages = {};
        if (template) {
            let parser = new DOMParser();
            let html = parser.parseFromString(template, "text/html");
            templateElement = html.querySelector("template");
            let css = html.querySelector("style");
            if (css) {
                document.head.appendChild(css);
            }
            let scriptElement = html.querySelector("script");
            if (scriptElement) {
                let textContent = scriptElement.textContent.replaceAll(/\s+/g, " ");
                let rawMessagesFunction = eval("(" + textContent + ")")
                let rawMessages = rawMessagesFunction();
                for (const rawMessage of rawMessages) {
                    let message = i18nMessages[rawMessage["en"]] = {}
                    message["de"] = rawMessage["de"];
                }
            }
        }

        class SimplicityComponent extends clazz {

            component = new Component();

            i18n(text) {
                let language = appManager.language;
                if (language === "en") {
                    return text;
                } else {
                    return i18nMessages[text][language]
                }
            }

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
                    if (!this.component.initialized) {

                        if (template) {
                            this.component.addContext("template");
                            this.isCompositeComponent = true;

                            this.content = buildContent(this);

                            if (clazz.components) {
                                checker(clazz.components, templateElement.content, this.localName)
                            }

                            let fragment = buildContext(this, templateElement.content);

                            variableBinding(this, fragment);

                            if (this.preInitialize) {
                                this.preInitialize()
                            }

                            createProcessors(this);

                            this.appendChild(fragment);

                        } else {
                            createProcessors(this);

                            if (Reflect.has(this, "dynamicTemplate")) {
                                this.component.addContext("template");
                                this.isCompositeComponent = true;

                                let template = document.createDocumentFragment();

                                template.appendChild(this.dynamicTemplate)

                                this.content = buildContent(this);

                                if (clazz.components) {
                                    checker(clazz.components, template, this.localName)
                                }

                                let fragment = buildContext(this, template, false);

                                variableBinding(this, fragment);

                                this.appendChild(fragment);
                            }
                        }


                        if (this.initialize) {
                            this.initialize();
                        }

                        this.component.attributesChanged = false;
                        this.component.initialized = true;

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
                    if (!name.startsWith("native")) {
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

        traverse(html.children);

        let sortedComponents = components.sort();
        let sortedJsImports = jsImports.map(item => names.get(item)).sort();

        if (!isEqual(sortedComponents, sortedJsImports)) {
            let toMuch = sortedJsImports.filter((importz) => sortedComponents.indexOf(importz) === -1);
            let missing = sortedComponents.filter((component) => sortedJsImports.indexOf(component) === -1)

            console.log(`path: ${path} toMuch : ${toMuch.join(", ")} missing:  ${missing.join(", ")}`)
        }

    }
}