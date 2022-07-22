import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import {dateFormat, dateTimeFormat} from "../../../simplicity-core/services/tools.js";

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
        return dateTimeFormat(value, this.app.language)
    }

    date(value, meta) {
        return dateFormat(value, this.app.language)
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
                binding: "input"
            }, {
                name: "schema",
                binding: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/meta/meta-column.html")
    }


}

export default customComponents.define("meta-column", MetaColumn);