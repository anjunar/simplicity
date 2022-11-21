import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatSpinner extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/indicators/mat-spinner.html")
    }
}

export default customComponents.define("mat-spinner", MatSpinner)