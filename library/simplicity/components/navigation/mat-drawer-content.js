import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatDrawerContent extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-drawer-content.html")
    }
}

export default customComponents.define("mat-drawer-content", MatDrawerContent)