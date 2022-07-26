import {customComponents} from "../simplicity.js";
import {Input, isEqual, Membrane, mix} from "../services/tools.js";

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
            if (! isEqual(this.model[name], component.model)) {
                this.model[name] = component.model;
            }
            this.asyncValidationHandler();
        })

        if (this.model) {
            let value = this.model[component.name];
            if (value !== undefined) {
                component.model = value;
                component.value = value;
                component.defaultValue = value;
            }

            Membrane.track(this.model, {
                property : component.name,
                element : this,
                handler : (value) => {
                    component.model = value;
                    component.value = value;
                    component.dispatchEvent(new CustomEvent("input"));
                    this.asyncValidationHandler();
                }
            })
        }

        component.formular = this;
    }

    get dirty() {
        let method = () => {
            return this.components.some((component) => component.dirty.method());
        }
        let resonator = (context, element) => {
            for (const component of this.components) {
                component.dirty.resonator(context, element);
            }
            return [];
        }
        let activator = (callback) => {
            let mutationObserver = new MutationObserver(() => {
                callback();
            })
            mutationObserver.observe(this, {childList : true, subtree: true})
        }
        return {method, resonator, activator}
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
                binding: "two-way"
            }
        ]
    }

}

export default customComponents.define("dom-form", DomForm, {extends: "form"})