import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import MatImageUpload from "../../form/mat-image-upload.js";
import DomLazySelect from "../../form/dom-lazy-select.js";
import {jsonClient} from "../../../services/client.js";

class MetaColumnImage extends HTMLElement {

    model;
    meta;

    domLazySelectSource(model) {
        let link = model.links.list;
        return (query, callback) => {
            jsonClient.action(link.method, link.url)
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
                type: "input"
            }, {
                name : "meta",
                type : "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-column/meta-column-lazy-select.html")
    }

}

export default customComponents.define("meta-column-lazy-select", MetaColumnImage)