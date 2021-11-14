import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatProgressBar extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/indicators/mat-progress-bar.html")
    }
}

export default customComponents.define("mat-progress-bar", MatProgressBar)