import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";

class Compiler extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/expert/compiler/functionality.html")
    }

}

export default customViews.define({
    name: "expert-compiler-index",
    class: Compiler
})