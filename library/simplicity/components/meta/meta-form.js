import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import MetaInput from "./meta-input.js";
import DomForm from "../../directives/dom-form.js";
import {jsonClient} from "../../services/client.js";

class MetaForm extends HTMLElement {

    model = {};

    properties() {
        let result = [];
        for (const property of Object.keys(this.model.$schema.properties)) {
            let value = {};
            Object.assign(value, this.model.$schema.properties[property])
            value.name = property;
            result.push(value)
        }
        return result;
    }

    send(action) {
        jsonClient.action(action.method, action.url, {body : this.model})
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