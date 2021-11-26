import {customComponents} from "../simplicity.js";
import DomForm from "./dom-form.js";
import {lifeCycle} from "../processors/life-cycle-processor.js";
import {debounce} from "../services/tools.js";

class DomInput extends HTMLInputElement {

    model = "";

    errors = [];
    asyncValidators = [];

    initialize() {

        let asyncValidationHandler = () => {
            if (this.asyncValidators.length > 0) {
                let results = [];
                for (const validator of this.asyncValidators) {
                    let result = validator.validate(this)
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
                        })
                    results.push(result);
                }

                Promise.all(results)
                    .then(() => {
                        document.dispatchEvent(new CustomEvent("lifecycle"))
                    })
                    .catch(() => {
                        document.dispatchEvent(new CustomEvent("lifecycle"))
                    })
            }
        }

        asyncValidationHandler();

        let valueChangeHandler = () => {
            if (this.type === "number") {
                this.model = Number.parseInt(this.value);
            } else {
                this.model = this.value
            }
            this.dispatchEvent(new CustomEvent("model"))
        }

        let selectedChangeHandler = () => {
            this.model = this.checked;
            this.dispatchEvent(new CustomEvent("model"))
        }

        let fileChangeHandler = (event) => {
            let files = event.target.files;

            for (let i = 0, file; file = files[i]; i++) {

                let reader = new FileReader();

                reader.onload = ((theFile) => {
                    return (e) => {
                        this.dispatchEvent(new CustomEvent("load", {
                            detail: {
                                data: e.target.result,
                                name: theFile.name,
                                lastModified: theFile.lastModified
                            }
                        }))
                    };
                })(file);

                reader.readAsDataURL(file);
            }
        }

        switch (this.type) {
            case "checkbox" : {
                this.addEventListener("input", selectedChangeHandler, {lifeCylce: false});
            }
                break
            case "file" : {
                this.addEventListener("input", fileChangeHandler, {lifeCylce: false});
            }
                break;
            case "radio" : {
                this.addEventListener("input", valueChangeHandler, {lifeCylce: false});
            }
                break;
            default : {
                this.addEventListener("input", valueChangeHandler, {lifeCylce: false});
                this.addEventListener("model", debounce(asyncValidationHandler, 300), {lifeCylce: false});
                this.addEventListener("focus", () => {
                    document.dispatchEvent(new CustomEvent("lifecycle"));
                }, {lifeCylce: false});
            }
                break;
        }

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    get validity() {
        return new Proxy(super.validity, {
            get : (target, p, receiver) => {
                if (this.errors.indexOf(p) > -1) {
                    return true;
                }
                return target[p]
            },

            getOwnPropertyDescriptor: function(target, key) {
                return { enumerable: true, configurable: true };
            },

            ownKeys : (target) => {
                return Object.keys(target).concat(this.errors);
            }
        })
    }

    addAsyncValidator(value) {
        this.asyncValidators.push(value);
    }

    get isInput() {
        return true;
    }

    get dirty() {
        return this.defaultValue !== this.value;
    }

    get pristine() {
        return !this.dirty;
    }

    get valid() {
        return this.validity.valid && this.errors.length === 0;
    }

    reset() {
        this.value = this.defaultValue;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
                switch (this.type) {
                    case "radio" : {
                        if (newValue === this.value) {
                            this.checked = true;
                        }
                    }
                        break;
                    case "checkbox" : {
                        if (newValue) {
                            this.checked = true
                        }
                    }
                        break;
                    default : {
                        this.value = newValue;
                    }
                }
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

export default customComponents.define("dom-input", DomInput, {extends: "input"})