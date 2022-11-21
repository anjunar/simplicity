import {customComponents} from "../../../simplicity/simplicity.js";
import MetaFilterCheckbox from "./meta-table-filter/meta-filter-checkbox.js";
import MetaFilterLazySelect from "./meta-table-filter/meta-filter-lazy-select.js";
import MetaFilterDuration from "./meta-table-filter/meta-filter-duration.js";
import MetaFilterInput from "./meta-table-filter/meta-filter-input.js";
import MetaFilterLazyMultiSelect from "./meta-table-filter/meta-filter-lazy-multi-select.js";
import {libraryLoader} from "../../util/loader.js";

class MetaTableFilter extends HTMLElement {

    schema;
    model;
    name;

    container;

    load() {
        switch (this.schema.widget) {
            case "checkbox" :
                return MetaFilterCheckbox
            case "lazy-select" :
                return MetaFilterLazySelect
            case "lazy-multi-select" :
                return MetaFilterLazyMultiSelect
            case "datetime-local" :
                return MetaFilterDuration
            case "date" :
                return MetaFilterDuration
            case "number" :
                return MetaFilterDuration
            default :
                return MetaFilterInput
        }
    }

    initialize() {
        let result = this.load();
        let component = new result();
        component.schema = this.schema;
        component.model = this.model;
        component.name = this.name;
        component.render();
        component.addEventListener("model", () => {
            this.dispatchEvent(new CustomEvent("model"));
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
                binding: "input"
            }, {
                name: "model",
                binding: "two-way"
            }, {
                name: "name",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/meta/meta-table-filter.html")
    }


}

export default customComponents.define("meta-table-filter", MetaTableFilter);