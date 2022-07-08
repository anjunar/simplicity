import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomLazyMultiSelect from "../../../../simplicity-core/components/form/dom-lazy-multi-select.js";

class MetaInputLazyMultiSelect extends HTMLElement {

    property;
    schema;

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
            .entries(meta.items.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => data[name])
            .join(" ")
    }

    domLazySelectLabel(meta) {
        return Object
            .entries(meta.items.properties)
            .filter(([name,property]) => property.naming)
            .map(([name, property]) => name)
    }
    
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
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazyMultiSelect]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-lazy-multi-select.html")
    }

}

export default customComponents.define("meta-input-lazy-multi-select", MetaInputLazyMultiSelect);