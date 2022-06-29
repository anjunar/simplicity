import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import MetaInput from "./meta-input.js";
import DomForm from "../../directives/dom-form.js";

class MetaForm extends HTMLElement {

    model = {};

    register(element) {
        return this.model.$schema.properties[element.property]
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomForm, MetaInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-form.html")
    }


}

export default customComponents.define("meta-form", MetaForm);