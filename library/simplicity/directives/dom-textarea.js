import {customComponents} from "../simplicity.js";
import DomForm from "./dom-form.js";

class DomTextarea extends HTMLTextAreaElement {

    initialized = false;

    get isInput() {
        return true;
    }

    initialize() {
        let valueChangeHandler = () => {
            if (! this.initialized) {
                this.defaultValue = this.value;
                this.initialized = true;
            }
            this.dispatchEvent(new CustomEvent("value"))
        }

        this.addEventListener("keyup", valueChangeHandler)
        this.addEventListener("change", valueChangeHandler)

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    get dirty() {
        return this.defaultValue !== this.value;
    }

    get pristine() {
        return ! this.dirty;
    }

    reset() {
        this.value = this.defaultValue;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value" : {
                this.value = newValue;
            } break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "value",
                type: "two-way"
            }
        ]
    }


}

export default customComponents.define("dom-textarea", DomTextarea, {extends : "textarea"})