import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomTextarea from "../../../../simplicity-core/directives/dom-textarea.js";

class MetaInputTextarea extends HTMLElement {

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
        return [DomTextarea]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-textarea.html")
    }

}

export default customComponents.define("meta-input-textarea", MetaInputTextarea);