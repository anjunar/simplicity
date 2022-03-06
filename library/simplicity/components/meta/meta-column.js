import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import {dateFormat, dateTimeFormat} from "../../services/tools.js";
import {appManager} from "../../manager/app-manager.js";

class MetaColumn extends HTMLElement {

    model;
    schema;

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
        return dateTimeFormat(value, appManager.language)
    }

    date(value, meta) {
        return dateFormat(value, appManager.language)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break;
            case "schema" : {
                this.schema = newValue;
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
                name: "schema",
                type: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-column.html")
    }


}

export default customComponents.define("meta-column", MetaColumn);