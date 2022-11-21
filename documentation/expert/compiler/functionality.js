import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

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