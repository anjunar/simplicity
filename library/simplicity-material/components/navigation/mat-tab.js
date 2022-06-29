import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatTab extends HTMLElement {

    selected = false;

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/navigation/mat-tab.html")
    }

}

export default customComponents.define("mat-tab", MatTab)