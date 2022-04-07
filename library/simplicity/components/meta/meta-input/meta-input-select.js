import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import DomSelect from "../../../directives/dom-select.js";
import MatInputContainer from "../../form/container/mat-input-container.js";

class MetaInputSelect extends HTMLElement {

    schema;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomSelect, MatInputContainer]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-select.html")
    }

}

export default customComponents.define("meta-input-select", MetaInputSelect)