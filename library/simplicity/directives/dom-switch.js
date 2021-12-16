import {customComponents} from "../simplicity.js";

class DomSwitch extends HTMLTemplateElement {

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "predicate" : {
                if (this.nextElementSibling?.isSwitch) {
                    this.nextElementSibling.remove();
                }
                let element = this.content.querySelector(`[case=${newValue}]`);
                if (element) {
                    // No Op
                } else {
                    element = this.content.querySelector(`[case=default]`)
                }
                let component = document.importComponent(element);
                component.isSwitch = true;
                this.insertAdjacentElement("afterend", component);
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

export default customComponents.define("dom-switch", DomSwitch, {extends : "template"})