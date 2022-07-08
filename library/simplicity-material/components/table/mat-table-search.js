import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatTableSearch extends HTMLElement {

    path
    sortable;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "path" : {
                this.path = newValue;
            }
                break;
            case "sortable" : {
                this.sortable = newValue
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "path",
                binding: "input"
            }, {
                name: "sortable",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

}

export default customComponents.define("mat-table-search", MatTableSearch)