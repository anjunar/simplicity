import {attributeProcessorRegistry} from "./processors/attribute-processors.js";
import {register} from "./services/view-manager.js";
import {TextProcessor} from "./processors/text-processor.js";
import {lifeCycle} from "./processors/life-cycle-processor.js";

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

export function createProcessors(element) {
    for (const attribute of Array.from(element.attributes)) {
        for (const AttributeProcessor of attributeProcessorRegistry) {
            if (!attribute.processor) {
                let processor = new AttributeProcessor(attribute, element);
                if (processor.matched) {
                    attribute.processor = processor;
                    if (!processor.runOnce) {
                        element.attributeBindings = element.attributeBindings || [];
                        element.attributeBindings.push(processor);
                    }
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
                    element.textNodeProcessors = element.textNodeProcessors || [];
                    element.textNodeProcessors.push(textProcessor);
                }
            }
        }
    }
    element.hydrated = true;
}

function createProcessorsTree(element) {
    if (element.localName.indexOf("-") > -1) {
        return;
    }

    let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
            if (node.localName.indexOf("-") > -1) {
                return NodeFilter.FILTER_REJECT;
            }
            if (node.preventHydration) {
                return NodeFilter.FILTER_SKIP;
            }
            if (node.hydrated) {
                return NodeFilter.FILTER_SKIP;
            }
            if (node.isConnected) {
                return NodeFilter.FILTER_ACCEPT;
            } else {
                if (node.localName === "template") {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_SKIP;
                }
            }
        }
    });

    let node = iterator.nextNode();
    while (node !== null) {
        if (node.isConnected) {
            createProcessors(node);
        } else {
            let parentElement = node.parentNode;
            // Import the Template Element for initialization
            let importNode = document.importNode(node, true);
            // Replace the uninitialized Template Element with the initialized
            parentElement.replaceChild(importNode, node, false);
            // Call connnectedCallback because it is not triggered when placed inside a Template
            importNode.connectedCallback(true);
        }
        node = iterator.nextNode();
    }
}

/*
let mutationObserver = new MutationObserver((records) => {
    for (const record of records) {
        for (const addedNode of record.addedNodes) {
            createProcessorsTree(addedNode, addedNode);
        }
    }
})

mutationObserver.observe(document.body, {subtree:true, childList : true})
*/

Element.prototype.after = (function (_super) {
    return function (nodes, createProcessors = true) {
        if (nodes instanceof DocumentFragment) {
            let children = Array.from(nodes.children);
            _super.apply(this, [nodes])
            if (createProcessors) {
                for (const child of children) {
                    createProcessorsTree(child, this);
                }
            }
        } else {
            _super.apply(this, [nodes])
            if (createProcessors) {
                createProcessorsTree(nodes, this);
            }
        }
    }
})(Element.prototype.after)

Node.prototype.replaceChild = (function (_super) {
    return function (newChild, oldChild, createProcessors = true) {
        let result = _super.apply(this, [newChild, oldChild]);
        if (createProcessors) {
            createProcessorsTree(newChild, this);
        }
        return result;
    }
})(Node.prototype.replaceChild)

Node.prototype.appendChild = (function (_super) {
    return function (newChild, createProcessors = true) {
        if (newChild instanceof DocumentFragment) {
            let children = Array.from(newChild.children);
            let result = _super.apply(this, [newChild]);
            if (createProcessors) {
                for (const child of children) {
                    createProcessorsTree(child, this);
                }
            }
            return result;
        } else {
            let result = _super.apply(this, [newChild]);
            if (createProcessors) {
                createProcessorsTree(newChild, this);
            }
            return result;
        }

    }
})(Node.prototype.appendChild)

Element.prototype.insertAdjacentElement = (function (_super) {
    return function (position, insertedElement, createProcessors = true) {
        let result = _super.apply(this, [position, insertedElement]);
        if (createProcessors) {
            createProcessorsTree(result, this);
        }
        return result;
    }
})
(Element.prototype.insertAdjacentElement)

const blackList = ["mousemove", "mouseover", "loadend"]

EventTarget.prototype.addEventListener = (function (_super) {
    return function (name, callback, options = {lifeCycle : true}) {
        if (name !== "") {
            _super.apply(this, [name, (event) => {
                callback(event)
                if (blackList.indexOf(name) === -1 && options.lifeCycle) {
                    lifeCycle();
                }
            }], options)
        }
    }
})(EventTarget.prototype.addEventListener);

function findProperty(name, scope, lhsNode) {
    if (lhsNode.context?.length > 0) {
        for (const context of lhsNode.context) {
            switch (context) {
                case "slot" : {
                    if (lhsNode.template === scope) {
                        if (Reflect.has(lhsNode, name)) {
                            return lhsNode;
                        }
                    }
                }
                    break;
                case "repeat" : {
                    if (lhsNode.template === scope) {
                        if (Reflect.has(lhsNode, name)) {
                            return lhsNode;
                        }
                    }
                }
                    break;
                case "template" : {
                    if (lhsNode === scope) {
                        if (Reflect.has(lhsNode, name)) {
                            return lhsNode;
                        }
                    }
                }
                    break;
            }
        }
    }
    return lhsNode.parentNode.findProperty(name, scope);
}

document.importNode = (function (_super) {
    return function (node, deep) {
        let result = _super.apply(this, [node, deep]);

        function createLink(clone, original) {

            let lhsIterator = document.createNodeIterator(clone, NodeFilter.SHOW_ELEMENT);
            let rhsIterator = document.createNodeIterator(original, NodeFilter.SHOW_ELEMENT);

            let lhsNode = lhsIterator.nextNode();
            let rhsNode = rhsIterator.nextNode();

            for (const property of Object.keys(rhsNode)) {
                if (!(rhsNode[property] instanceof Function)) {
                    lhsNode[property] = rhsNode[property];
                }
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
                        },
                        findProperty: {
                            value: (name, scope) => {
                                return findProperty(name, scope, lhsNode);
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
})(document.importNode);

function buildContent() {
    if (!(this instanceof HTMLTemplateElement)) {
        this.content = document.createDocumentFragment();
        this.content.findProperty = (name, scope) => {
            return this.findProperty(name, scope);
        }
        for (const child of Array.from(this.children)) {
            this.content.root = this;
            this.content.appendChild(child, false);
        }
    }
}

function buildContext(root, templateElement) {
    let templateElementCloned = templateElement.cloneNode(true);

    if (!Reflect.has(root, "findProperty")) {
        Object.defineProperties(root, {
            findProperty: {
                value: (name, scope) => {
                    if (Reflect.has(root, name)) {
                        return root;
                    }
                    throw new Error(`Property not found: ${name} in template: ${scope.localName}`)
                }
            }
        })
    }

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
                    },
                    findProperty: {
                        value: (name, scope) => {
                            return findProperty(name, scope, lhsNode);
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
    function traverse(root, elements) {
        for (const node of elements) {
            if (node.localName !== "code") {
                for (const attribute of node.attributes) {
                    if (attribute.name === "bind:variable") {
                        let variableName = attribute.value;
                        root[variableName] = node;
                        node.variableBind = (node) => {
                            root[variableName] = node;
                        }
                    }
                }
                traverse(root, node.children);
            }
        }
    }

    traverse(root, template.content.children);
}

const names = new Map();

export const customComponents = new class CustomComponents {
    define(name, clazz, options) {

        let template = clazz.template;
        let domParser = new DOMParser();
        let html = domParser.parseFromString(template, "text/html");
        let templateElement = html.querySelector("template");
        let css = html.querySelector("style");
        if (css) {
            document.head.appendChild(css);
        }

        class SimplicityComponent extends clazz {

            context = [];
            attributesChanged = false;
            hydrated = false;

            attributeChangedCallback(name, oldValue, newValue) {
                if (!isEqual(oldValue, newValue)) {
                    this.attributesChanged = true;
                    super.attributeChangedCallback(name, oldValue, newValue)
                }
            }

            connectedCallback(force = false) {
                if (super.connectedCallback) {
                    super.connectedCallback();
                }

                if (this.isConnected || force) {
                    if (! this.hydrated) {
                        if (template) {
                            this.context = this.context || [];
                            this.context.push("template");

                            buildContent.call(this);

                            if (clazz.components) {
                                checker(clazz.components, templateElement, this.localName)
                            }

                            let template = buildContext(this, templateElement);

                            variableBinding(this, template);

                            createProcessors(this)

                            this.appendChild(template.content);

                            for (const child of this.content.children) {
                                createProcessorsTree(child);
                            }

                        } else {
                            createProcessors(this)
                        }

                        if (this.initialize) {
                            this.initialize();
                        }

                        this.attributesChanged = false;

                        this.hydrated = true;
                    }
                }

            }

            disconnectedCallback() {
                if (super.destroy) {
                    super.destroy();
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
                    if (components.indexOf(name) === -1) {
                        components.push(name);
                    }
                }

                if (element instanceof HTMLTemplateElement) {
                    traverse(element.content.children)
                }

                if (! element.preventHydration) {
                    traverse(element.children);
                }
            }
        }

        traverse(html.content.children);

        let sortedComponents = components.sort();
        let sortedJsImports = jsImports.map(item => names.get(item)).sort();

        if (!isEqual(sortedComponents, sortedJsImports)) {
            let toMuch = sortedJsImports.filter((importz) => sortedComponents.indexOf(importz) === -1);
            let missing = sortedComponents.filter((component) => sortedJsImports.indexOf(component) === -1)

            console.log(`path: ${path}\ntoMuch : ${toMuch.join(", ")}\nmissing:  ${missing.join(", ")}`)
        }

    }
}