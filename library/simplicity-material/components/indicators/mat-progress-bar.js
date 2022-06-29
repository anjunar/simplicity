import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatProgressBar extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/indicators/mat-progress-bar.html")
    }
}

export default customComponents.define("mat-progress-bar", MatProgressBar)