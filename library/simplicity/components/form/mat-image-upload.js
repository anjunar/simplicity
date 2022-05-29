import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomInput from "../../directives/dom-input.js";
import DomForm from "../../directives/dom-form.js";
import {Input, mix} from "../../services/tools.js";

class MatImageUpload extends mix(HTMLElement).with(Input) {

    input;

    name;

    model = {
        data : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        name : ""
    }

    placeholder = ""

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

    onLoad(event) {
        this.model.data = event.detail.data;
        this.model.lastModified = event.detail.lastModified;
        this.model.name = event.detail.name;
        this.dispatchEvent(new CustomEvent("model"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                if (newValue) {
                    this.model.data = newValue.data;
                    this.model.lastModified = newValue.lastModified;
                    this.model.name = newValue.name;
                }
            }
                break
            case "placeholder" : {
                this.placeholder = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "two-way"
            },
            {
                name: "placeholder",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-image-upload.html")
    }

}

export default customComponents.define("mat-image-upload", MatImageUpload)