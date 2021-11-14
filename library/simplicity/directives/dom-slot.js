import {customComponents} from "../simplicity.js";

class DomSlot extends HTMLSlotElement {

    source;
    name;
    selector;
    tag;
    implicit;
    index = 0;
    resilient = "false";
    import = "true";

    initialize() {
        this.render();
    }

    render() {
        let content;
        if (this.source) {
            content = this.source.content;
        } else {
            content = this.template.content;
        }
        let element;

        if (this.name) {
            let elements = content.querySelectorAll(`[slot=${this.name}]`);
            element = elements.item(this.index);
        }

        if (this.selector) {
            let elements = content.querySelectorAll(this.selector);
            element = elements.item(this.index);
        }

        if (this.tag) {
            let iterator = document.createNodeIterator(this, NodeFilter.SHOW_ELEMENT);
            let node = iterator.nextNode();
            while (node !== null) {
                if (node[this.tag]) {
                    break;
                }
                node = iterator.nextNode();
            }
            element = node;
        }

        if (! this.name && ! this.selector && ! this.tag) {
            let elements = content.children;
            element = elements[this.index];
        }

        if (element) {
            let importNode;
            if (this.import === "true") {
                importNode = document.importNode(element, true);
            } else {
                importNode = element;
            }

            if (this.implicit) {
                let implicitVariable = this.findProperty(this.implicit, this.template);
                let selector;
                if (importNode.hasAttribute("let")) {
                    selector = importNode;
                } else {
                    selector = importNode.querySelector("[let]");
                }
                let letVariable = selector.getAttribute("let")
                selector[letVariable] = implicitVariable[this.implicit];
                selector.context = selector.context || [];
                selector.context.push("slot")
            }

            if (this.firstElementChild) {
                this.firstElementChild.remove();
            }

            if (this.resilient === "true") {
                this.appendChild(importNode);
            } else {
                this.parentElement.replaceChild(importNode, this);
            }


        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "source" : {
                this.source = newValue
            } break;
            case "name" : {
                this.name = newValue;
            } break;
            case "selector" : {
                this.selector = newValue;
            } break;
            case "implicit" : {
                this.implicit = newValue;
            } break;
            case "index" : {
                this.index = newValue
            } break;
            case "resilient" : {
                this.resilient = newValue;
            } break
            case "import" : {
                this.import = newValue;
            } break
        }
    }

    static get observedAttributes() {
        return [
            {
                name : "source",
                type : "input"
            },
            {
                name: "name",
                type: "input"
            },
            {
                name: "selector",
                type: "input"
            },
            {
                name : "implicit",
                type : "input"
            },
            {
                name : "index",
                type : "input"
            },
            {
                name : "resilient",
                type: "input"
            },
            {
                name : "import",
                type : "input"
            }
        ]
    }

}

export default customComponents.define("dom-slot", DomSlot, {extends: "slot"})