import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";

class MatDrawerContainer extends HTMLElement {

    static get components() {
        return [DomSlot]
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-drawer-container.html")
    }

}

export default customComponents.define("mat-drawer-container", MatDrawerContainer)