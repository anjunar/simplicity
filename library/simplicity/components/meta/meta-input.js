import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomInput from "../../directives/dom-input.js";
import MatInputContainer from "../form/container/mat-input-container.js";
import MatImageUpload from "../form/mat-image-upload.js";
import MatCheckboxContainer from "../form/container/mat-checkbox-container.js";
import {jsonClient} from "../../services/client.js";
import DomLazySelect from "../form/dom-lazy-select.js";

class MetaInput extends HTMLElement {

    model;

    domLazySelect = (model) => {
        let link = model.links.find((link) => link.rel === "list");
        return (query, callback) => {
            jsonClient.action(link.method, link.url)
                .then((response) => {
                    callback(response.rows, response.size)
                })
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomInput, DomLazySelect, MatInputContainer, MatCheckboxContainer, MatImageUpload]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input.html")
    }


}

export default customComponents.define("meta-input", MetaInput);