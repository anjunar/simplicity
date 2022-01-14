import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatTab extends HTMLElement {

    selected = false;

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-tab.html")
    }

}

export default customComponents.define("mat-tab", MatTab)