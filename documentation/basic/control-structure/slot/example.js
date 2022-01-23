import {loader} from "../../../../library/simplicity/processors/loader-processor.js";
import {customComponents} from "../../../../library/simplicity/simplicity.js";

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
                type: "input"
            }
        ]
    }

    static get template() {
        return loader("documentation/basic/control-structure/slot/example.html");
    }

}

export default customComponents.define("control-structures-example", CommonExample)