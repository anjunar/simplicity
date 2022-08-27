import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../../simplicity-core/directives/dom-select.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import {Membrane} from "../../../../simplicity-core/services/tools.js";

class MetaInputSelect extends HTMLElement {

    property;
    schema;

    initialize() {
        let input = this.querySelector("select");
        if (this.schema.validators.notBlank || this.schema.validators.notNull) {
            input.required = true;
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
        return [DomSelect, MatInputContainer]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-select.html")
    }

}

export default customComponents.define("meta-input-select", MetaInputSelect)