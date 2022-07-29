import {customComponents} from "../simplicity.js";
import DomForm from "./dom-form.js";
import {css, Input, mix} from "../services/tools.js";

css({
    "textarea" : {
        width: "100%",
        border: "0",
        color: "var(--main-font-color)",
        backgroundColor: "var(--main-background-color)"
    }
})

class DomTextarea extends mix(HTMLTextAreaElement).with(Input) {

    model;

    constructor() {
        super();

        this.addEventListener("input", () => {
            this.model = this.value
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
                name: "model",
                binding: "two-way"
            }
        ]
    }


}

export default customComponents.define("dom-textarea", DomTextarea, {extends : "textarea"})