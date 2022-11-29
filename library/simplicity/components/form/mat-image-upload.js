import {customComponents} from "../../../simplicity/simplicity.js";
import DomInput from "../../../simplicity/directives/dom-input.js";
import DomForm from "../../../simplicity/directives/dom-form.js";
import {Input, mix} from "../../../simplicity/util/tools.js";
import {libraryLoader} from "../../util/loader.js";

class MatImageUpload extends mix(HTMLElement).with(Input) {

    input;

    name;

    model = {
        data: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        name: ""
    }

    value;

    placeholder = ""
    disabled = false;

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

    onAreaClick() {
        if (!this.disabled) {
            this.input.click()
        }
    }

    onLoad(event) {
        this.model = event.detail;
        this.value = this.model;
        this.dispatchEvent(new CustomEvent("model"));
        this.dispatchEvent(new CustomEvent("input"));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue
            }
                break
            case "placeholder" : {
                this.placeholder = newValue;
            }
                break
            case "disabled" : {
                this.disabled = newValue === "true"
            }
                break
            case "name" : {
                this.name = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                binding: "two-way"
            },
            {
                name: "placeholder",
                binding: "input"
            },
            {
                name : "disabled",
                binding: "input"
            },
            {
                name: "name",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-image-upload.html")
    }

}

export default customComponents.define("mat-image-upload", MatImageUpload)