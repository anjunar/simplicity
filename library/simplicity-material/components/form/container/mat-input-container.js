import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";

class MatInputContainer extends HTMLElement {

    placeholder;

    inputEmpty = true;
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

        input.addEventListener("input", inputListener);

        if (input.formular) {
            input.formular.addEventHandler("errors", this, () => {
                inputListener();
            })
        }

        inputListener();
    }

    get hasFocus() {
        let input = this.querySelector("input");
        let method = () => {
            return document.activeElement === input;
        }
        let resonator = (callback, element) => {
            input.addEventListener("focus", callback);
            input.addEventListener("blur", callback);

            element.addEventListener("removed", () => {
                input.removeEventListener("focus", callback);
                input.removeEventListener("blur", callback);
            })
        }
        return {method, resonator}
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
            binding : "input"
        }];
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/container/mat-input-container.html")
    }

}

export default customComponents.define("mat-input-container", MatInputContainer)