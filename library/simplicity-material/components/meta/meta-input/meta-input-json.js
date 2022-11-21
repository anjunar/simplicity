import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomForm from "../../../../simplicity-core/directives/dom-form.js";

class MetaInputJson extends HTMLElement {

    property;
    schema;
    model;

    preInitialize() {
        let form = this.queryUpwards((element) => element instanceof DomForm);
        this.model = form.model[this.property];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            } break;
            case "property" : {
                this.property = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-json.html")
    }

}

export default customComponents.define("meta-input-json", MetaInputJson)