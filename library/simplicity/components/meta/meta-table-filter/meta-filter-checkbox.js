import {customComponents} from "../../../../simplicity/simplicity.js";
import DomInput from "../../../../simplicity/directives/dom-input.js";
import {libraryLoader} from "../../../util/loader.js";

class MetaFilterCheckbox extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "model",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-table-filter/meta-filter-checkbox.html")
    }

}

export default customComponents.define("meta-filter-checkbox", MetaFilterCheckbox);