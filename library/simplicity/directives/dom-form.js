import {customComponents, Input, mix} from "../simplicity.js";

class DomForm extends mix(HTMLFormElement).with(Input) {

    components = [];

    initialize() {
        if (this.name) {
            let domForm = this.parentElement.queryUpwards((element) => element instanceof DomForm);
            if (domForm) {
                domForm.register(this);
            }
        }

        window.setTimeout(() => {
            this.dispatchEvent(new CustomEvent("model"));
        }, 300)
    }

    register(component) {
        this.components.push(component)
        component.addEventListener("model", () => {
            let name = component.name;
            this.model[name] = component.model;
            this.dispatchEvent(new CustomEvent("model"));
        })

        component.addEventListener("model", () => {
            this.dispatchEvent(new CustomEvent("model"));
        })

        let value = this.model[component.name];
        component.model = value;
        component.value = value;
        component.defaultValue = value;

        component.formular = this;
    }

    get dirty() {
        return this.components.some((component) => component.dirty)
    }

    reset() {
        for (const component of this.components) {
            component.reset();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;

                for (const component of this.components) {
                    let value = this.model[component.name];
                    component.model = value;
                    component.value = value;
                }

                this.dispatchEvent(new CustomEvent("model"));
            }
                break;
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

export default customComponents.define("dom-form", DomForm, {extends: "form"})