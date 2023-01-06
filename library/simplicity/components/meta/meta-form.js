import {customComponents} from "../../../simplicity/simplicity.js";
import DomForm from "../../../simplicity/directives/dom-form.js";
import {libraryLoader} from "../../util/loader.js";

class MetaForm extends HTMLElement {

    model = {};
    schema = {};

    register(element) {
        return this.schema.properties[element.property]
    }

    validate() {
        let element = this.querySelector("form");
        return element.validate();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break
            case "schema" : {
                this.schema = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                binding: "input"
            }, {
                name : "schema",
                binding : "input"
            }
        ]
    }

    static get components() {
        return [DomForm]
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-form.html")
    }


}

export default customComponents.define("meta-form", MetaForm);