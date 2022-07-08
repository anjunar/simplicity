import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomLazyMultiSelect from "../../../../simplicity-core/components/form/dom-lazy-multi-select.js";

class MetaColumnLazyMultiSelect extends HTMLElement {

    model;
    meta;

    domLazySelectSource(meta) {
        let link = meta.links.list;
        return (query, callback) => {
            fetch(link.url, {method : link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object.entries(meta.items.properties)
            .filter(([property, value]) => value.naming)
            .map(([property, value]) => data[property]).join(" ")
    }

    domLazySelectLabel(meta) {
        return Object.entries(meta.items.properties)
            .filter(([property, value]) => value.naming)
            .map(([property, value]) => property)
    }


    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break;
            case "meta" : {
                this.meta = newValue;
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                binding: "input"
            }, {
                name : "meta",
                binding : "input"
            }
        ]
    }

    static get components() {
        return [DomLazyMultiSelect]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-column/meta-column-lazy-multi-select.html")
    }

}

export default customComponents.define("meta-column-lazy-multi-select", MetaColumnLazyMultiSelect)