import {customComponents} from "../../../simplicity/simplicity.js";

class MatTableSearch extends HTMLElement {

    path
    schema;
    visible = true;

    get sortable() {
        return this.schema.type === "string"
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "path" : {
                this.path = newValue;
            }
                break;
            case "schema" : {
                this.schema = newValue
            }
                break
            case "visible" : {
                this.visible = newValue;
            }

        }
    }

    static get observedAttributes() {
        return [
            {
                name: "path",
                binding: "input"
            }, {
                name: "schema",
                binding: "input"
            }, {
                name: "visible",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

}

export default customComponents.define("mat-table-search", MatTableSearch)