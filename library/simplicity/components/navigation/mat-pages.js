import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";

class MatPages extends HTMLElement {

    page = 0;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "page" : {
                this.page = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "page",
                type: "input"
            }
        ]
    }

    static get components() {
        return [DomSlot];
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-pages.html");
    }
}

export default customComponents.define("mat-pages", MatPages);