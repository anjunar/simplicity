import {customComponents} from "../simplicity.js";
import DomForm from "./dom-form.js";
import {Input, mix} from "../util/tools.js";

class DomSelect extends mix(HTMLSelectElement).with(Input) {

    constructor() {
        super();
        this.addEventListener("input", () => {
            this.model = this.value;
            this.dispatchEvent(new CustomEvent("model"));
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

        let options = Array.from(this.options);

        let option = options.find(option => option.value === this.model);

        this.selectedIndex = options.indexOf(option)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
                this.value = newValue;
            } break;
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

export default customComponents.define("dom-select", DomSelect, {extends : "select"})