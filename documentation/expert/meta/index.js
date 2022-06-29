import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";

class Index extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/expert/meta/index.html")
    }

}

export default customViews.define({
    name : "meta-index",
    class : Index
})