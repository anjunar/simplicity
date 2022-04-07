import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import DomForm from "../../../directives/dom-form.js";
import {dateFormat, dateTimeFormat} from "../../../services/tools.js";
import {appManager} from "../../../manager/app-manager.js";

class MetaInputView extends HTMLElement {

    schema;
    model;
    name;

    preInitialize() {
        this.name = this.schema.name;

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    multiSelect(model, meta) {
        return model.map((item) => Object
            .entries(meta.items.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => item[name])
            .join(" ")
        ).join(" ")
    }

    select(model, meta) {
        return Object
            .entries(meta.properties)
            .filter(([name, property]) => property.naming)
            .map(([name, property]) => model[name])
            .join(" ")
    }

    dateTime(value, meta) {
        if (value) {
            return dateTimeFormat(value, appManager.language)
        }
        return "";
    }

    date(value, meta) {
        if (value) {
            return dateFormat(value, appManager.language)
        }
        return "";
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                type: "input"
            }
        ]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-input/meta-input-view.html")
    }

}

export default customComponents.define("meta-input-view", MetaInputView)
