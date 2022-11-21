import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatDrawerContainer extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-drawer-container.html")
    }

}

export default customComponents.define("mat-drawer-container", MatDrawerContainer)