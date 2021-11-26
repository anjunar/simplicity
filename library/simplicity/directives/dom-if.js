import {customComponents} from "../simplicity.js";

class DomIf extends HTMLTemplateElement {

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "predicate" : {
                if (oldValue !== newValue) {
                    if (newValue) {
                        let newChild = this.content.firstElementChild;
                        if (newChild) {
                            let importNode = document.importComponent(newChild);
                            importNode.isIf = true;
                            this.insertAdjacentElement("afterend", importNode);
                        }
                    } else {
                        if (this.nextElementSibling?.isIf) {
                            this.nextElementSibling.remove();
                        }
                    }
                }
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "predicate",
                type: "input"
            }
        ]
    }

}

export default customComponents.define("dom-if", DomIf, {extends : "template"})