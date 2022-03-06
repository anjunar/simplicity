import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatTableExtension extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/table/mat-table-extension.html")
    }

}

export default customComponents.define("mat-table-extension", MatTableExtension)