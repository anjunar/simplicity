import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatDrawerContainer extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/mat-drawer-container.html")
    }

}

export default customComponents.define("mat-drawer-container", MatDrawerContainer)