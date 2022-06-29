import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import DomTextarea from "../../../directives/dom-textarea.js";

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
                type: "input"
            }, {
                name: "property",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomTextarea]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-textarea.html")
    }

}

export default customComponents.define("meta-input-textarea", MetaInputTextarea);