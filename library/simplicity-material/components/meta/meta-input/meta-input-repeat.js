import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomForm from "../../../../simplicity-core/directives/dom-form.js";
import MetaForm from "../meta-form.js";
import MetaInput from "../meta-input.js";
import {Input, Membrane, mix} from "../../../../simplicity-core/services/tools.js";

class MetaInputRepeat extends mix(HTMLElement).with(Input) {

    property;
    schema;
    name;
    model;
    dirty = false;

    addItem() {
        let chunk = {$schema : this.schema.items};
        this.model.push(chunk)
        this.dirty = true;
        this.dispatchEvent(new Event("input"))
    }

    removeItem(value) {
        let indexOf = this.model.indexOf(value);
        this.model.splice(indexOf);
        this.dirty = true;
        this.dispatchEvent(new Event("input"))
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

        Membrane.track(this, {
            property : "dirty",
            element : this,
            handler : (value) => {
                this.schema.dirty = value;
            }
        })
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
        return [MetaForm, MetaInput]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-repeat.html")
    }

}

export default customComponents.define("meta-input-repeat", MetaInputRepeat)