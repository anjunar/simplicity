import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatTableExtension extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity/components/table/mat-table-extension.html")
    }

}

export default customComponents.define("mat-table-extension", MatTableExtension)