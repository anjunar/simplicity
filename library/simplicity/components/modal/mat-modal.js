import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatModal extends HTMLElement {
    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/modal/mat-modal.html")
    }
}

export default customComponents.define("mat-modal", MatModal)