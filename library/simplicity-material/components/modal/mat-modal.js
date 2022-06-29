import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatModal extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/modal/mat-modal.html")
    }
}

export default customComponents.define("mat-modal", MatModal)