import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatInputContainer from "../../form/container/mat-input-container.js";
import DomLazyMultiSelect from "../../form/dom-lazy-multi-select.js";
import {jsonClient} from "../../../services/client.js";

class MetaFilterLazyMultiSelect extends HTMLElement {

    schema;
    name;
    model;

    onModel() {
        this.dispatchEvent(new CustomEvent("model"))
    }

    domLazySelect(schema) {
        let link = schema.links.list;
        return (query, callback) => {
            jsonClient.action(link.method, `${link.url}?index=${query.index}&limit=${query.limit}`)
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
            }
                break;
            case "name" : {
                this.name = newValue;
            } break;
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
                name: "name",
                type : "input"
            }, {
                name : "model",
                type : "input"
            }
        ]
    }

    static get components() {
        return [MatInputContainer, DomLazyMultiSelect]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table-filter/meta-filter-lazy-multi-select.html")
    }

}

export default customComponents.define("meta-filter-lazy-multi-select", MetaFilterLazyMultiSelect);