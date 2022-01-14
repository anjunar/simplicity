import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatDrawerContainer extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-drawer-container.html")
    }

}

export default customComponents.define("mat-drawer-container", MatDrawerContainer)