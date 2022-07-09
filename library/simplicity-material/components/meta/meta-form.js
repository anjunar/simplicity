import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import DomForm from "../../../simplicity-core/directives/dom-form.js";

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
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomForm]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-form.html")
    }


}

export default customComponents.define("meta-form", MetaForm);