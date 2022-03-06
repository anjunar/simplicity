import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MetaInput extends HTMLElement {

    name;
    schema;

    container;

    load() {
        switch (this.schema.widget) {
            case "checkbox" : return import("./meta-input/meta-input-checkbox.js");
            case "editor" : return import("./meta-input/meta-input-editor.js");
            case "image" : return import("./meta-input/meta-input-image-upload.js");
            case "lazy-multi-select" : return import("./meta-input/meta-input-lazy-multi-select.js");
            case "lazy-select" : return import("./meta-input/meta-input-lazy-select.js");
            case "textarea" : return import("./meta-input/meta-input-textarea.js");
            default : return import("./meta-input/meta-input-input.js");
        }
    }

    initialize() {
        this.load().then(result => {
            let component = new result.default();
            component.schema = this.schema;
            component.name = this.name;
            this.container.appendChild(component);
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "name" : {
                this.name = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }, {
                name: "name",
                type: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input.html")
    }


}

export default customComponents.define("meta-input", MetaInput);