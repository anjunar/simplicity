import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomInput from "../../../directives/dom-input.js";

class MetaInputInput extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("input");
        let validators = this.schema.validators;

        if (validators.notBlank || validators.notNull) {
            input.required = true;
        }
        if (validators.size) {
            input.maxLength = validators.size.max;
            input.minLength = validators.size.min;
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
        return [MatInputContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-input.html")
    }

}

export default customComponents.define("meta-input-input", MetaInputInput);