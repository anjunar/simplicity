import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";

class MatModal extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/modal/mat-modal.html")
    }
}

export default customComponents.define("mat-modal", MatModal)