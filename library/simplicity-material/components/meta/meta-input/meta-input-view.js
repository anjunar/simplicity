import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";
import DomForm from "../../../../simplicity-core/directives/dom-form.js";
import {dateFormat, dateTimeFormat} from "../../../../simplicity-core/services/tools.js";
import {appManager} from "../../../../simplicity-core/manager/app-manager.js";

class MetaInputView extends HTMLElement {

    property;
    schema;
    model;
    name;

    preInitialize() {
        this.name = this.property

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
            return dateTimeFormat(value, this.app.language)
        }
        return "";
    }

    date(value, meta) {
        if (value) {
            return dateFormat(value, this.app.language)
        }
        return "";
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "schema" : {
                this.schema = newValue;
            } break;
            case "property" : {
                this.property = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "schema",
                binding: "input"
            }, {
                name: "property",
                binding: "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-input/meta-input-view.html")
    }

}

export default customComponents.define("meta-input-view", MetaInputView)
