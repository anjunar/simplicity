import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";

class MatPage extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-page.html")
    }

}

export default customComponents.define("mat-page", MatPage)