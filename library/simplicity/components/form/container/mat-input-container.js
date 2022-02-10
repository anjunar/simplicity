import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";

class MatInputContainer extends HTMLElement {

    placeholder;

    initialize() {
        let element = this.querySelector("input");
        element.placeholder = this.placeholder;

        let errors = this.querySelectorAll("*[slot=error] *[name]");
        for (const error of errors) {
            error.style.display = "none"
        }

    }

    update() {
        let errors = this.querySelectorAll("*[slot=error] *[name]");
        for (const errorElement of errors) {
            errorElement.style.display = "none";
        }

        let input = this.querySelector("input");

        if (input) {
            for (const validity in input.validity) {
                if (input.validity[validity] === true) {
                    let errorElement = this.querySelector(`*[slot=error] *[name=${validity}]`);
                    if (errorElement) {
                        errorElement.style.display = "inline"
                    }
                }
            }

            if (input.formular) {
                for (const error of input.formular.errors) {
                    let errorElement = this.querySelector(`*[slot=error] *[name=${error}]`);
                    if (errorElement) {
                        if (input.formular.errors.length > 0) {
                            errorElement.style.display = "inline";
                        }
                    }
                }
            }
        }
    }

    inputEmpty() {
        let element = this.querySelector("input");
        if (element) {
            return element.value === "" && element.type !== "local-datetime" && element.type !== "date"
        }
    }

    hasFocus() {
        let element = this.querySelector("input");
        if (element) {
            return document.activeElement === element;
        }
    }

    hasErrors() {
        let element = this.querySelector("input");
        if (element) {
            return element.errors.length > 0 || element.formular?.errors.length > 0 || ! element.validity.valid;
        }
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