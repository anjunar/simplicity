import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatCheckboxContainer from "../../form/container/mat-checkbox-container.js";
import DomInput from "../../../../simplicity-core/directives/dom-input.js";

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
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatCheckboxContainer, DomInput]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-checkbox.html")
    }

}

export default customComponents.define("meta-input-checkbox", MetaInputCheckbox);