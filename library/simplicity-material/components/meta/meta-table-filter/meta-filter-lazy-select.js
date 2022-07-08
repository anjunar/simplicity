import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomLazySelect from "../../../../simplicity-core/components/form/dom-lazy-select.js";

class MetaFilterLazySelect extends HTMLElement {

    schema;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            fetch(`${link.url}?index=${query.index}&limit=${query.limit}`, {method : link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => data[name])
            .join(" ")
    }

    domLazySelectLabel(meta) {
        return Object
            .entries(meta.properties)
            .filter(([name,property]) => property.naming)
            .map(([name, property]) => name)
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
                binding : "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazySelect]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-table-filter/meta-filter-lazy-select.html")
    }

}

export default customComponents.define("meta-filter-lazy-select", MetaFilterLazySelect);