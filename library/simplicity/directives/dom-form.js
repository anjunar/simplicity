import {customComponents} from "../simplicity.js";
import {debounce} from "../services/tools.js";
import {lifeCycle} from "../processors/life-cycle-processor.js";

class DomForm extends HTMLFormElement {

    model = {};
    components = [];
    validators = [];
    errors = [];

    validationHandler() {
        let results = [];
        for (const validator of this.validators) {
            results.push(validator.validate(this)
                .then((result) => {
                    let indexOf = this.errors.indexOf(result);
                    if (indexOf > -1) {
                        this.errors.splice(indexOf, 1);
                    }
                })
                .catch((reason) => {
                    let indexOf = this.errors.indexOf(reason);
                    if (indexOf === -1) {
                        this.errors.push(reason)
                    }
                }))
        }
        Promise.all(results)
            .then(() => {
                document.dispatchEvent(new CustomEvent("lifecycle"))
            })
            .catch(() => {
                document.dispatchEvent(new CustomEvent("lifecycle"))
            })
    }

    initialize() {
        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return (element instanceof DomForm) && (element !== this);
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        window.setTimeout(() => {
            this.validationHandler();
        }, 300)
    }

    addValidator(value) {
        this.validators.push(value);
    }

    register(component) {
        this.components.push(component)
        component.addEventListener("model", () => {
            let name = component.name;
            this.model[name] = component.model;
            this.dispatchEvent(new CustomEvent("model"));
        })

        component.addEventListener("model", debounce(this.validationHandler.bind(this), 300))

        for (const component of this.components) {
            let value = this.model[component.name];
            component.model = value;
            component.defaultValue = value;
        }

        component.formular = this;
    }

    get dirty() {
        return this.components.some((component) => component.dirty)
    }

    get pristine() {
        return ! this.dirty
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

export default customComponents.define("dom-form", DomForm, {extends : "form"})