import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatFooter extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-footer.html")
    }

}

export default customComponents.define("mat-footer", MatFooter)