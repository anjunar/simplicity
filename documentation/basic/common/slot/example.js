import {loader} from "../../../../library/simplicity/processors/loader-processor.js";
import {customComponents} from "../../../../library/simplicity/simplicity.js";
import DomRepeat from "../../../../library/simplicity/directives/dom-repeat.js";
import DomSlot from "../../../../library/simplicity/directives/dom-slot.js";

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
        return [DomRepeat, DomSlot]
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
        return loader("documentation/basic/examples/example.html");
    }

}

export default customComponents.define("common-example", CommonExample)