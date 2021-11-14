import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatSpinner extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/indicators/mat-spinner.html")
    }
}

export default customComponents.define("mat-spinner", MatSpinner)