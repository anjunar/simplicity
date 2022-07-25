import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";

class AppIntroduction extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/getting-started/installation.html")
    }

}

export default customViews.define({
    name: "advanced-getting-started",
    class: AppIntroduction
});