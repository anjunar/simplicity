import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import DomForm from "../../../directives/dom-form.js";
import MetaForm from "../meta-form.js";

class MetaInputRepeat extends HTMLElement {

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
        this.name = this.schema.name;

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
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MetaForm]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-repeat.html")
    }

}

export default customComponents.define("meta-input-repeat", MetaInputRepeat)