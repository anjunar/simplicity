import {customComponents} from "../simplicity.js";
import DomForm from "./dom-form.js";
import {css, Input, mix} from "../services/tools.js";

css({
    "input" : {
        border: "0",
        color: "var(--main-font-color)",
        backgroundColor: "inherit"
    },
    "input:focus" : {
        outline: "0",
        color: "var(--main-font-color)",
        backgroundColor: "inherit"
    },
/*
    "input:-internal-autofill-selected" : {
        color: "var(--main-font-color) !important",
        backgroundColor: "inherit"
    },
*/
    "input[type=checkbox]" : {
        appearance: "none",
        fontFamily: "'Material Icons', fantasy",
        fontSize: "medium",
        margin: "0",
        outline: "0"
    },
    "input[type=checkbox]::before" : {
        content: "'check_box_outline_blank'",
        color: "var(--main-font-color)"
    },
    "input[type=checkbox]:checked::before" : {
        content: "'check_box'",
        color: "var(--main-selected-color)"
    },
    "input[type=checkbox][toggle]::before" : {
        content: "'toggle_off'",
        color: "var(--main-font-color)"
    },
    "input[type=checkbox][toggle]:checked::before" : {
        content: "'toggle_on'",
        color: "var(--main-selected-color)"
    }
})


class DomInput extends mix(HTMLInputElement).with(Input) {


    initialize() {
        let valueChangeHandler = () => {
            if (this.type === "number") {
                this.model = this.valueAsNumber || "";
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

        this.render();
    }

    render() {
        switch (this.type) {
            case "radio" : {
                if (this.model === this.value) {
                    this.checked = true;
                }
            }
                break;
            case "checkbox" : {
                this.checked = this.model;
            }
                break;
            default : {
                this.value = this.model;
            }
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break;
        }
        this.render();
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

export default customComponents.define("dom-input", DomInput, {extends: "input"})