import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import DomSlot from "../../../directives/dom-slot.js";

class MatCheckboxContainer extends HTMLElement {

    placeholder = "";

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "placeholder" : {
                this.placeholder = newValue;
            }
        }
    }

    static get components() {
        return [DomSlot]
    }

    static get observedAttributes() {
        return [{
            name: "placeholder",
            type: "input"
        }];
    }

    static get template() {
        return loader("library/simplicity/components/form/container/mat-checkbox-container.html")
    }

}

export default customComponents.define("mat-checkbox-container", MatCheckboxContainer)