import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatProgressBar from "../../../library/simplicity/components/indicators/mat-progress-bar.js";

class Spinner extends HTMLElement {

    static get components() {
        return [MatProgressBar, DomCode]
    }

    static get template() {
        return loader("documentation/basic/indicators/progress.html")
    }

}

export default customViews.define({
    name: "indicators-progress",
    class: Spinner
})