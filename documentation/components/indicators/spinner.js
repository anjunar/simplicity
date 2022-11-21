import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import MatSpinner from "../../../library/simplicity/components/indicators/mat-spinner.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Spinner extends HTMLElement {

    static get components() {
        return [MatSpinner, DomCode]
    }

    static get template() {
        return loader("documentation/components/indicators/spinner.html")
    }

}

export default customViews.define({
    name: "indicators-spinner",
    class: Spinner
})