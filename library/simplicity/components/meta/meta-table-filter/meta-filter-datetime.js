import {customComponents} from "../../../../simplicity/simplicity.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomInput from "../../../../simplicity/directives/dom-input.js";
import {libraryLoader} from "../../../util/loader.js";

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
        return libraryLoader("simplicity/components/meta/meta-table-filter/meta-filter-datetime.html")
    }

}

export default customComponents.define("meta-filter-datetime", MetaFilterDatetime);