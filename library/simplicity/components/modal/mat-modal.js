import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";

class MatModal extends HTMLElement {
    static get components() {
        return [DomSlot]
    }

    static get template() {
        return loader("library/simplicity/components/modal/mat-modal.html")
    }
}

export default customComponents.define("mat-modal", MatModal)