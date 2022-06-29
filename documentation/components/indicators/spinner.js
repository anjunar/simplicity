import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import MatSpinner from "../../../library/simplicity-material/components/indicators/mat-spinner.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";

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