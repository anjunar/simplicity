import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatSpinner extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/indicators/mat-spinner.html")
    }
}

export default customComponents.define("mat-spinner", MatSpinner)