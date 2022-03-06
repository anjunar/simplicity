import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

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
                type: "input"
            }, {
                name: "sortable",
                type: "input"
            }
        ]
    }

    static get components() {
        return []
    }

}

export default customComponents.define("mat-table-search", MatTableSearch)