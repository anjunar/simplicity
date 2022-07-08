import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatTab extends HTMLElement {

    selected = false;

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/mat-tab.html")
    }

}

export default customComponents.define("mat-tab", MatTab)