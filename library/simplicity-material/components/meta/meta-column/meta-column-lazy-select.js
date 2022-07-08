import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomLazySelect from "../../../../simplicity-core/components/form/dom-lazy-select.js";

class MetaColumnImage extends HTMLElement {

    model;
    meta;

    domLazySelectSource(model) {
        let link = model.links.list;
        return (query, callback) => {
            fetch(link.url, {method : link.method})
                .then(response => response.json())
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return Object.entries(meta.properties)
            .filter(([property, value]) => value.naming)
            .map(([property, value]) => data[property]).join(" ")
    }

    domLazySelectLabel(meta) {
        return Object.entries(meta.properties)
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
        return [DomLazySelect]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-column/meta-column-lazy-select.html")
    }

}

export default customComponents.define("meta-column-lazy-select", MetaColumnImage)