import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomInput from "../../../../simplicity-core/directives/dom-input.js";

class MetaFilterDatetime extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    preInitialize() {
        let element = this.model[this.name];
        if (!element) {
            this.model[this.name] = {
                from : undefined,
                to : undefined
            }
        }
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
                name : "model",
                binding : "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomInput]
    }

    static get template() {
        return loader("library/simplicity-material/components/meta/meta-table-filter/meta-filter-datetime.html")
    }

}

export default customComponents.define("meta-filter-datetime", MetaFilterDatetime);