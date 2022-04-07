import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MetaTableFilter extends HTMLElement {

    schema;
    model;

    container;

    load() {
        switch (this.schema.widget) {
            case "checkbox" :
                return import("./meta-table-filter/meta-filter-checkbox.js");
            case "lazy-multi-select" :
                return import("./meta-table-filter/meta-filter-lazy-multi-select.js");
            case "lazy-select" :
                return import("./meta-table-filter/meta-filter-lazy-select.js");
            case "datetime-local" :
                return import("./meta-table-filter/meta-filter-datetime.js");
            case "date" :
                return import("./meta-table-filter/meta-filter-datetime.js");
            default :
                return import("./meta-table-filter/meta-filter-input.js");
        }
    }

    initialize() {
        this.load().then(result => {
            let component = new result.default();
            component.schema = this.schema;
            component.model = this.model;
            component.addEventListener("model", () => {
                this.dispatchEvent(new CustomEvent("model"))
            })
            this.container.appendChild(component);
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
                break;
            case "model" : {
                this.model = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }, {
                name : "model",
                type : "two-way"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table-filter.html")
    }


}

export default customComponents.define("meta-table-filter", MetaTableFilter);