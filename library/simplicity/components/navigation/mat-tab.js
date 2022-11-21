import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatTab extends HTMLElement {

    selected = false;

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-tab.html")
    }

}

export default customComponents.define("mat-tab", MatTab)