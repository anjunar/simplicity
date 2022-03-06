import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import MetaInput from "./meta-input.js";
import DomForm from "../../directives/dom-form.js";
import {jsonClient} from "../../services/client.js";

class MetaForm extends HTMLElement {

    model = {};

    send(action) {
        jsonClient.action(action.method, action.url, {body : this.model})
    }

    links(links) {
        return Object.entries(links).filter(([key, link]) => link.method !== "GET");
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
        return [DomForm, MetaInput]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-form.html")
    }


}

export default customComponents.define("meta-form", MetaForm);