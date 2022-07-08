import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatToolbar extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/mat-toolbar.html")
    }

}

export default customComponents.define("mat-toolbar", MatToolbar)