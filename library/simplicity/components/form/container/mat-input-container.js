import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";

class MatInputContainer extends HTMLElement {

    placeholder;

    inputEmpty = true;
    hasFocus = false;
    hasErrors = false;

    initialize() {
        let input = this.querySelector("input");
        if (input) {
            input.placeholder = this.placeholder;

            let errors = this.querySelectorAll("*[slot=error] *[name]");
            for (const error of errors) {
                error.style.display = "none"
            }
        }

        let inputListener = () => {
            this.inputEmpty = input.value === "" && input.type !== "datetime-local" && input.type !== "date";
            this.hasErrors = input.errors.length > 0 || input.formular?.errors.length > 0 || ! input.validity.valid;

            let errors = this.querySelectorAll("*[slot=error] *[name]");
            for (const errorElement of errors) {
                errorElement.style.display = "none";
            }

            if (input) {
                for (const validity in input.validity) {
                    if (input.validity[validity] === true && validity !== "valid") {
                        let errorElement = this.querySelector(`*[slot=error] *[name=${validity}]`);
                        errorElement.style.display = "inline"
                    }
                }

                if (input.formular) {
                    for (const error of input.formular.errors) {
                        let errorElement = this.querySelector(`*[slot=error] *[name=${error}]`);
                        errorElement.style.display = "inline";
                    }
                }
            }
        };

        let focusListener = () => {
            this.hasFocus = document.activeElement === input;
        };

        input.addEventListener("input", inputListener);
        input.addEventListener("focus", focusListener);
        input.addEventListener("blur", focusListener);

        if (input.formular) {
            input.formular.addEventHandler("errors", this, () => {
                inputListener();
            })
        }

        inputListener();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "placeholder" : {
                this.placeholder = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [{
            name : "placeholder",
            type : "input"
        }];
    }

    static get template() {
        return loader("library/simplicity/components/form/container/mat-input-container.html")
    }

}

export default customComponents.define("mat-input-container", MatInputContainer)