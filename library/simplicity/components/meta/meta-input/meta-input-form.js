import {customComponents} from "../../../../simplicity/simplicity.js";
import MetaForm from "../meta-form.js";
import MetaInput from "../meta-input.js";
import DomForm from "../../../../simplicity/directives/dom-form.js";
import {Input, mix} from "../../../../simplicity/util/tools.js";
import {Membrane} from "../../../service/membrane.js";
import {libraryLoader} from "../../../util/loader.js";

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
        return libraryLoader("simplicity/components/meta/meta-input/meta-input-form.html")
    }

}

export default customComponents.define("meta-input-form", MetaInputForm)