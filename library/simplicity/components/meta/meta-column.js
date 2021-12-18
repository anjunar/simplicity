import {customComponents} from "../../simplicity.js";
import {jsonClient} from "../../services/client.js";
import DomInput from "../../directives/dom-input.js";
import DomSwitch from "../../directives/dom-switch.js";
import DomLazySelect from "../form/dom-lazy-select.js";
import MatImageUpload from "../form/mat-image-upload.js";
import {loader} from "../../processors/loader-processor.js";

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
        let naming = meta.properties.filter((property) => property.naming)
        return data.firstName + " " + data.lastName;
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
        return [DomInput, DomSwitch, DomLazySelect, MatImageUpload]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-column.html")
    }


}

export default customComponents.define("meta-column", MetaColumn);