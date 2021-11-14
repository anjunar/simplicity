import {customComponents} from "../simplicity.js";

class DomSelect extends HTMLSelectElement {

    defaultValue;
    initialized = false;
    model;

    constructor() {
        super();
        this.addEventListener("input", () => {
            if (! this.initialized) {
                this.initialized = true;
                this.defaultValue = this.value;
            }
            this.model = this.value;
            this.dispatchEvent(new CustomEvent("model"));
        }, {lifeCycle : false})
    }

    isInput() {
        return true;
    }

    get dirty() {
        return !this.pristine;
    }

    get pristine() {
        return this.defaultValue === this.value;
    }

    reset() {
        this.value = this.defaultValue;
        this.dispatchEvent(new Event("input"));
    }

    get valid() {
        return true;
    }

    initialize() {
        let options = Array.from(this.options);

        let option = options.find(option => option.value === this.value);

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
                type: "two-way"
            }
        ]
    }
}

export default customComponents.define("dom-select", DomSelect, {extends : "select"})