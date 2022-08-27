import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomInput from "../../../../simplicity-core/directives/dom-input.js";
import {Membrane} from "../../../../simplicity-core/services/tools.js";

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

        Membrane.track(input, {
            property : "dirty",
            element : this,
            handler : (value) => {
                this.schema.dirty = value;
            }
        })
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
        return [MatInputContainer, DomInput]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-input.html")
    }

}

export default customComponents.define("meta-input-input", MetaInputInput);