import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatImageUpload from "../../form/mat-image-upload.js";

class MetaColumnImage extends HTMLElement {

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
        return [MatImageUpload]
    }

    static get template() {
        return loader("library/simplicity-material/components/meta/meta-column/meta-column-image.html")
    }

}

export default customComponents.define("meta-column-image", MetaColumnImage)