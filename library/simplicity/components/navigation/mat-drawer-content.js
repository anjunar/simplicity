import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatDrawerContent extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-drawer-content.html")
    }
}

export default customComponents.define("mat-drawer-content", MatDrawerContent)