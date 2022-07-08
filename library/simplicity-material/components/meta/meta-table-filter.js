import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import MetaFilterCheckbox from "./meta-table-filter/meta-filter-checkbox.js";
import MetaFilterLazySelect from "./meta-table-filter/meta-filter-lazy-select.js";
import MetaFilterDatetime from "./meta-table-filter/meta-filter-datetime.js";
import MetaFilterInput from "./meta-table-filter/meta-filter-input.js";

class MetaTableFilter extends HTMLElement {

    schema;
    model;

    container;

    load() {
        switch (this.schema.widget) {
            case "checkbox" :
                return MetaFilterCheckbox
            case "lazy-select" :
                return MetaFilterLazySelect
            case "datetime-local" :
                return MetaFilterDatetime
            case "date" :
                return MetaFilterDatetime
            default :
                return MetaFilterInput
        }
    }

    initialize() {
        let result = this.load();
        let component = new result();
        component.schema = this.schema;
        component.model = this.model;
        component.addEventListener("model", () => {
            this.dispatchEvent(new CustomEvent("model"))
        })
        this.container.appendChild(component);
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
                binding: "input"
            }, {
                name : "model",
                binding : "two-way"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-table-filter.html")
    }


}

export default customComponents.define("meta-table-filter", MetaTableFilter);