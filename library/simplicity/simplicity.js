import {attributeProcessorRegistry} from "./processors/attribute-processors.js";
import {register} from "./services/view-manager.js";
import {TextProcessor} from "./processors/text-processor.js";
import {lifeCycle} from "./processors/life-cycle-processor.js";
import {debounce} from "./services/tools.js";

document.addEventListener("lifecycle", debounce(() => {
    lifeCycle();
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
                    document.dispatchEvent(new CustomEvent("lifecycle"));
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

        for (const property of Object.keys(rhsNode)) {
            if (!(rhsNode[property] instanceof Function) && property !== "component") {
                lhsNode[property] = rhsNode[property];
            }
        }

        if (rhsNode.component) {
            lhsNode.component.context = rhsNode.component.context;
        }

        if (rhsNode.variableBind) {
            lhsNode.variableBind = rhsNode.variableBind;
            rhsNode.variableBind(lhsNode);
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
    if (!(element instanceof HTMLTemplateElement)) {
        element.content = document.createDocumentFragment();
        templateBinding(element.content)
        for (const child of Array.from(element.children)) {
            element.content.root = element;
            element.content.appendChild(child);
        }
    }
}

function enrich(templateElement) {
    function hasBinding(element) {
        for (const attribute of element.attributes) {
            if (attribute.name.startsWith("bind:")) {
                return true;
            }
        }
        return false;
    }

    function hasTextInterpolation(element) {
        let interpolationRegExp = /\${([^}]+)}/g;
        return interpolationRegExp.test(element.textContent)
    }

    function isTemplateRepeat(node, template) {
        return template && node.parentNode === template.content && template.getAttribute("is") === "dom-repeat"
    }

    function iterate(element, template) {
        let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();
        while (node != null) {
            if (node.localName.indexOf("-") === -1 && ! node.hasAttribute("is")) {
                if (hasBinding(node) || hasTextInterpolation(node) || isTemplateRepeat(node, template)) {
                    node.setAttribute("is", "native-" + node.localName);
                    import("./components/native/native-" + node.localName + ".js")
                        .then(() => {
                            document.dispatchEvent(new CustomEvent("lifeCycle"))
                        })
                }
            }

            if (node instanceof HTMLTemplateElement && node.hasAttribute("is")) {
                iterate(node.content, node);
            }
            node = iterator.nextNode();
        }
    }

    iterate(templateElement.content);
}

function buildContext(root, templateElement) {
    let templateElementCloned = document.importNode(templateElement, true);

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

            if (node instanceof HTMLTemplateElement) {
                createLink(root, node.content);
            }

            node = iterator.nextNode();
        }
    }

    createLink(root, templateElementCloned.content);

    return templateElementCloned;
}

function variableBinding(root, template) {
    let iterator = document.createNodeIterator(template.content, NodeFilter.SHOW_ELEMENT);
    let node = iterator.nextNode();
    while (node !== null) {
        function scope(node) {
            for (const attribute of node.attributes) {
                if (attribute.name === "bind:variable") {
                    let variableName = attribute.value;
                    root[variableName] = node;
                    node.variableBind = (node) => {
                        root[variableName] = node;
                    }
                }
            }
        }
        scope(node);
        node = iterator.nextNode();
    }
}

export function templateBinding(content) {
    let mutationObserver = new MutationObserver((records) => {
        let mutationRecord = records.find((record) => record.addedNodes);
        if (mutationRecord) {
            for (const addedNode of mutationRecord.addedNodes) {
                if (addedNode instanceof HTMLTemplateElement && addedNode.hasAttribute("is")) {
                    let component = addedNode.queryUpwards((element) => element.localName.indexOf("-") > -1);
                    if (! component && ! addedNode.component.initialized) {
                        let parentElement = addedNode.parentNode;
                        // Import the Template Element for initialization
                        let importNode = document.importComponent(addedNode);
                        // Replace the uninitialized Template Element with the initialized
                        parentElement.replaceChild(importNode, addedNode);
                        // Call connnectedCallback because it is not triggered when placed inside a Template
                        importNode.connectedCallback(true);
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

export const customComponents = new class CustomComponents {
    define(name, clazz, options) {

        let template = clazz.template;
        let domParser = new DOMParser();
        let html = domParser.parseFromString(template, "text/html");
        let templateElement = html.querySelector("template");
        if (templateElement) {
            enrich(templateElement);
            let parsed = domParser.parseFromString(templateElement.outerHTML, "text/html");
            templateElement = parsed.querySelector("template")
        }
        let css = html.querySelector("style");
        if (css) {
            document.head.appendChild(css);
        }

        class SimplicityComponent extends clazz {

            component = {
                context : [],
                attributesChanged : false,
                initialized : false,
                attributeBindings : [],
                textNodeProcessors : [],
                addContext : (value) => {
                    this.component.context.push(value);
                },
                hasContext : () => {
                    return this.component.context.length > 0;
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
                    if (! this.component.initialized) {

                        if (template) {
                            this.component.addContext("template");

                            buildContent(this);

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

                        document.dispatchEvent(new CustomEvent("lifecycle"));
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