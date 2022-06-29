import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatImageUpload from "../../form/mat-image-upload.js";
import DomInput from "../../../../simplicity-core/directives/dom-input.js";

class MetaColumnInput extends HTMLElement {

    model;
    meta;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break;
            case "meta" : {
                this.meta = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "input"
            }, {
                name : "meta",
                type : "input"
            }
        ]
    }

    static get components() {
        return [DomInput]
    }

    static get template() {
        return loader("library/simplicity-material/components/meta/meta-column/meta-column-input.html")
    }

}

export default customComponents.define("meta-column-input", MetaColumnInput)