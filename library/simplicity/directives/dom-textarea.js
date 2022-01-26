import {customComponents, Input, mix} from "../simplicity.js";
import DomForm from "./dom-form.js";

class DomTextarea extends mix(HTMLTextAreaElement).with(Input) {


    constructor() {
        super();

        this.addEventListener("input", () => {
            this.dispatchEvent(new CustomEvent("model"))
        })
    }

    initialize() {
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
            case "model" : {
                this.model = newValue;
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