import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatCheckboxContainer from "../../form/container/mat-checkbox-container.js";
import DomInput from "../../../../simplicity-core/directives/dom-input.js";

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
                type: "input"
            }, {
                name : "model",
                type : "input"
            }
        ]
    }

    static get components() {
        return [MatCheckboxContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity-material/components/meta/meta-table-filter/meta-filter-checkbox.html")
    }

}

export default customComponents.define("meta-filter-checkbox", MetaFilterCheckbox);