import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomSlot from "../../directives/dom-slot.js";

class MatDrawerContent extends HTMLElement {

    static get components() {
        return [DomSlot]
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-drawer-content.html")
    }
}

export default customComponents.define("mat-drawer-content", MatDrawerContent)