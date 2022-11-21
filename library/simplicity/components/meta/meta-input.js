import {customComponents} from "../../../simplicity/simplicity.js";
import DomLazySelect from "../../../simplicity/components/form/dom-lazy-select.js";
import MatInputContainer from "../form/container/mat-input-container.js";
import {libraryLoader} from "../../util/loader.js";

class MetaInput extends HTMLElement {

    property;
    schema;

    container;

    category(query, callback) {
        fetch(`service/control/users/user/connections/connection/categories?index=${query.index}&limit=${query.limit}`)
            .then(response => response.json())
            .then(response => {
                callback(response.rows, response.size);
            })
    }

    load() {
        switch (this.schema.widget) {
            case "checkbox" : return import("./meta-input/meta-input-checkbox.js");
            case "editor" : return import("./meta-input/meta-input-editor.js");
            case "image" : return import("./meta-input/meta-input-image-upload.js");
            case "lazy-multi-select" : return import("./meta-input/meta-input-lazy-multi-select.js");
            case "lazy-select" : return import("./meta-input/meta-input-lazy-select.js");
            case "textarea" : return import("./meta-input/meta-input-textarea.js");
            case "repeat" : return import("./meta-input/meta-input-repeat.js");
            case "select" : return import("./meta-input/meta-input-select.js");
            case "json" : return import("./meta-input/meta-input-json.js");
            case "form" : return import("./meta-input/meta-input-form.js");
            default : return import("./meta-input/meta-input-input.js");
        }
    }

    initialize() {
        this.load().then(result => {
            let component = new result.default({schema : this.schema, property : this.property});
            component.render();
            this.container.appendChild(component);
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            } break
            case "property" : {
                this.property = newValue;
            } break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            },
            {
                name : "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect, MatInputContainer]
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-input.html")
    }


}

export default customComponents.define("meta-input", MetaInput);