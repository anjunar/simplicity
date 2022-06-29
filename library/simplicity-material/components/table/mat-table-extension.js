import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatTableExtension extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/table/mat-table-extension.html")
    }

}

export default customComponents.define("mat-table-extension", MatTableExtension)