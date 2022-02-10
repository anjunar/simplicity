import {customComponents} from "../../simplicity.js";
import {jsonClient} from "../../services/client.js";
import DomInput from "../../directives/dom-input.js";
import DomLazySelect from "../form/dom-lazy-select.js";
import MatImageUpload from "../form/mat-image-upload.js";
import {loader} from "../../processors/loader-processor.js";
import DomLazyMultiSelect from "../form/dom-lazy-multi-select.js";

class MetaColumn extends HTMLElement {

    model;
    meta;

    domLazySelectSource(model) {
        let link = model.links.find((link) => link.rel === "list");
        return (query, callback) => {
            jsonClient.action(link.method, link.url)
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    domLazySelectOption(meta, data) {
        return meta.properties.filter((property) => property.naming).map((property) => data[property.name]).join(" ")
    }

    domLazySelectLabel(meta) {
        return meta.properties.filter((property) => property.naming).map((property) => property.name)
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
                type: "input"
            },
            {
                name: "meta",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomInput, DomLazySelect, DomLazyMultiSelect, MatImageUpload]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-column.html")
    }


}

export default customComponents.define("meta-column", MetaColumn);