import {loader} from "../../../../library/simplicity-core/processors/loader-processor.js";
import {customComponents} from "../../../../library/simplicity-core/simplicity.js";

class CommonExample extends HTMLElement {

    items = [];

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                this.items = newValue;
            } break;
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [
            {
                name: "items",
                binding: "input"
            }
        ]
    }

    static get template() {
        return loader("documentation/basic/control/slot/example.html");
    }

}

export default customComponents.define("common-example", CommonExample)