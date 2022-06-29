import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatEditor from "../../form/mat-editor.js";

class MetaInputEditor extends HTMLElement {

    property;
    schema;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            } break;
            case "property" : {
                this.property = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            } , {
                name: "property",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MatEditor]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-editor.html")
    }

}

export default customComponents.define("meta-input-editor", MetaInputEditor);