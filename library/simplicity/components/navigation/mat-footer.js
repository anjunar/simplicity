import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatFooter extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-footer.html")
    }

}

export default customComponents.define("mat-footer", MatFooter)