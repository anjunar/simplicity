import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";
import MatProgressBar from "../../../library/simplicity-material/components/indicators/mat-progress-bar.js";

class Spinner extends HTMLElement {

    static get components() {
        return [MatProgressBar, DomCode]
    }

    static get template() {
        return loader("documentation/components/indicators/progress.html")
    }

}

export default customViews.define({
    name: "indicators-progress",
    class: Spinner
})