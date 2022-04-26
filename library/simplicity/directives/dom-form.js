import {customComponents} from "../simplicity.js";
import {Input, mix} from "../services/tools.js";
import {membraneFactory} from "../processors/html-compiler-processor.js";

class DomForm extends mix(HTMLFormElement).with(Input) {

    components = [];
    dirty = false;

    initialize() {
        if (this.name) {
            let domForm = membraneFactory(this.parentElement.queryUpwards((element) => element instanceof DomForm));
            if (domForm) {
                domForm.register(this);
            }
        }

        window.setTimeout(() => {
            this.asyncValidationHandler();
        }, 300)
    }

    update() {
        for (const component of this.components) {
            if (this.model) {
                let value = this.model[component.name];
                if (value !== undefined) {
                    if (component.model !== value) {
                        component.model = value;
                        component.value = value;
                    }
                }
            }
        }
    }

    register(component) {
        this.components.push(component)
        component.addEventListener("model", () => {
            let name = component.name;
            this.model[name] = component.model;
            this.asyncValidationHandler();
        })

        this.addEventHandler("model", this, () => {
            if (this.model) {
                let value = this.model[component.name];
                if (value !== undefined) {
                    component.model = value;
                    component.value = value;
                    component.defaultValue = value;
                }

                this.model.addEventHandler(component.name, this, (value) => {
                    component.model = value;
                    component.value = value;
                })
            }
        })

        component.formular = this;

        component.addEventHandler("dirty", this, (value) => {
            this.dirty = this.components.some((component) => component.dirty);
        })
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
                    if (value !== component.model) {
                        component.model = value;
                        component.value = value;
                    }
                }

                this.asyncValidationHandler();
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