import {customComponents} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/util/loader.js";
import {isEqual} from "../../../../library/simplicity/util/tools.js";

class CommonExample extends HTMLElement {

    items = [];

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                if (! isEqual(this.items, newValue)) {
                    this.items = newValue;
                }
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