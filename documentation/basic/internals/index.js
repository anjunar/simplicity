import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";

class Internals extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/internals/index.html")
    }

}

export default customViews.define({
    name : "internals-index",
    class : Internals
})