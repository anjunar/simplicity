import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatImageUpload from "../../form/mat-image-upload.js";

class MetaInputImageUpload extends HTMLElement {

    schema;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MatImageUpload]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-image-upload.html")
    }

}

export default customComponents.define("meta-input-image-upload", MetaInputImageUpload);