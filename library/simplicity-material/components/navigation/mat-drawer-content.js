import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatDrawerContent extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/mat-drawer-content.html")
    }
}

export default customComponents.define("mat-drawer-content", MatDrawerContent)