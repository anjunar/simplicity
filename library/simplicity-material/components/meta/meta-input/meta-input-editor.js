import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
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
                binding: "input"
            } , {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatEditor]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-editor.html")
    }

}

export default customComponents.define("meta-input-editor", MetaInputEditor);