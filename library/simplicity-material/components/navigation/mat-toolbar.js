import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatToolbar extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/navigation/mat-toolbar.html")
    }

}

export default customComponents.define("mat-toolbar", MatToolbar)