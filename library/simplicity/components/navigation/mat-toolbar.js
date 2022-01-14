import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatToolbar extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-toolbar.html")
    }

}

export default customComponents.define("mat-toolbar", MatToolbar)