import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatProgressBar extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/indicators/mat-progress-bar.html")
    }
}

export default customComponents.define("mat-progress-bar", MatProgressBar)