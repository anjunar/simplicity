import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatProgressBar extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/indicators/mat-progress-bar.html")
    }
}

export default customComponents.define("mat-progress-bar", MatProgressBar)