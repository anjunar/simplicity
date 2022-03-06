import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatCheckboxContainer from "../../form/container/mat-checkbox-container.js";
import DomInput from "../../../directives/dom-input.js";

class MetaInputCheckbox extends HTMLElement {

    schema;
    name;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "name" : {
                this.name = newValue;
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
            }
        ]
    }

    static get components() {
        return [MatCheckboxContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-checkbox.html")
    }

}

export default customComponents.define("meta-input-checkbox", MetaInputCheckbox);