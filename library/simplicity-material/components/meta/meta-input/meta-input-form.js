import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import MetaForm from "../meta-form.js";
import MetaInput from "../meta-input.js";
import DomForm from "../../../../simplicity-core/directives/dom-form.js";
import {Input, Membrane, mix} from "../../../../simplicity-core/services/tools.js";

class MetaInputForm extends mix(HTMLElement).with(Input) {

    property;
    schema;
    name;

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

        Membrane.track(this, {
            property : "dirty",
            element : this,
            handler : (value) => {
                this.schema.dirty = value;
            }
        })
    }

    validate() {
        let metaForm = this.querySelector("meta-form");
        return metaForm.validate();
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
            } , {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MetaForm, MetaInput]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-form.html")
    }

}

export default customComponents.define("meta-input-form", MetaInputForm)