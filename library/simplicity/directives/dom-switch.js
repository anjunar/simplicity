import {customComponents} from "../simplicity.js";

class DomSwitch extends HTMLTemplateElement {

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "predicate" : {
                if (this.nextElementSibling?.isSwitch) {
                    this.nextElementSibling.remove();
                }
                let caseElement = this.content.querySelector(`case[value=${newValue}]`);
                if (caseElement) {
                    // No Op
                } else {
                    caseElement = this.content.querySelector(`case[value=default]`)
                }
                let component = document.importComponent(caseElement.firstElementChild);
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