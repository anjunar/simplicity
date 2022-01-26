import {customComponents, mix, Input} from "../simplicity.js";
import DomForm from "./dom-form.js";
import {lifeCycle} from "../processors/life-cycle-processor.js";


class DomInput extends mix(HTMLInputElement).with(Input) {


    constructor() {
        super();

        let valueChangeHandler = () => {
            if (this.type === "number") {
                this.model = this.valueAsNumber;
            } else {
                this.model = this.value;
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
                this.addEventListener("input", selectedChangeHandler);
            }
                break
            case "file" : {
                this.addEventListener("input", fileChangeHandler);
            }
                break;
            case "radio" : {
                this.addEventListener("input", valueChangeHandler);
            }
                break;
            default : {
                this.addEventListener("input", valueChangeHandler);
                this.addEventListener("focus", () => {
                    lifeCycle();
                });
            }
                break;
        }
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

                switch (this.type) {
                    case "radio" : {
                        if (this.model === this.value) {
                            this.checked = true;
                        }
                    }
                        break;
                    case "checkbox" : {
                        if (this.model) {
                            this.checked = true
                        }
                    }
                        break;
                    default : {
                        this.value = this.model;
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