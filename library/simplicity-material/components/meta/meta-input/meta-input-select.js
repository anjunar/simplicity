import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../../simplicity-core/directives/dom-select.js";
import MatInputContainer from "../../form/container/mat-input-container.js";

class MetaInputSelect extends HTMLElement {

    property;
    schema;

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