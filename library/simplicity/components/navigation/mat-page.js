import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatPage extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-page.html")
    }

}

export default customComponents.define("mat-page", MatPage)