import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomInput from "../../../directives/dom-input.js";

class MetaFilterInput extends HTMLElement {

    schema;
    name;
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
            case "name" : {
                this.name = newValue;
            } break;
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
                name: "name",
                type : "input"
            }, {
                name : "model",
                type : "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table-filter/meta-filter-input.html")
    }

}

export default customComponents.define("meta-filter-input", MetaFilterInput);