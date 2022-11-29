import {customComponents} from "../../../../simplicity/simplicity.js";
import {Membrane} from "../../../service/membrane.js";
import {libraryLoader} from "../../../util/loader.js";

class MatInputContainer extends HTMLElement {

    placeholder;

    inputEmpty = true;
    hasErrors = false;

    initialize() {
        let input = this.querySelector("dom-lazy-select") || this.querySelector("input");
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

        window.setTimeout(() => {
            if (input.formular) {
                Membrane.track(input.formular, {
                    property : "errors",
                    element : this,
                    handler : () => {
                        inputListener();
                    }
                })
            }
        })

        inputListener();
    }

    get hasFocus() {
        let input = this.querySelector("input");
        let method = () => {
            return document.activeElement === input;
        }
        let resonator = (callback, element) => {
            if (input) {
                input.addEventListener("focus", callback);
                input.addEventListener("blur", callback);

                element.addEventListener("removed", () => {
                    input.removeEventListener("focus", callback);
                    input.removeEventListener("blur", callback);
                })
            }
            return [];
        }
        let activator = (callback) => {
            let mutationObserver = new MutationObserver(() => {
                callback();
            })
            mutationObserver.observe(this, {childList : true, subtree : true})
        }
        return {method, resonator, activator}
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
        return libraryLoader("simplicity/components/form/container/mat-input-container.html")
    }

}

export default customComponents.define("mat-input-container", MatInputContainer)