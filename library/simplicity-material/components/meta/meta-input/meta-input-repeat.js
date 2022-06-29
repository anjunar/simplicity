import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomForm from "../../../../simplicity-core/directives/dom-form.js";
import MetaForm from "../meta-form.js";

class MetaInputRepeat extends HTMLElement {

    property;
    schema;
    name;
    model;

    addItem() {
        let chunk = {$schema : this.schema.items};
        this.model.push(chunk)
    }

    removeItem(value) {
        let indexOf = this.model.indexOf(value);
        this.model.splice(indexOf); 
    }

    preInitialize() {
        this.name = this.property;

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
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
                type: "input"
            }, {
                name: "property",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MetaForm]
    }

    static get template() {
        return loader("library/simplicity-material/components/meta/meta-input/meta-input-repeat.html")
    }

}

export default customComponents.define("meta-input-repeat", MetaInputRepeat)