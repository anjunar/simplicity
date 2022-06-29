import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatCheckboxContainer from "../../form/container/mat-checkbox-container.js";
import DomInput from "../../../directives/dom-input.js";

class MetaInputCheckbox extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("input");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            } break;
            case "property" : {
                this.property = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }, {
                name: "property",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MatCheckboxContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-checkbox.html")
    }

}

export default customComponents.define("meta-input-checkbox", MetaInputCheckbox);