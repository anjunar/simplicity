import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatPage extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/mat-page.html")
    }

}

export default customComponents.define("mat-page", MatPage)