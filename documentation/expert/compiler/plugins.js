import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";

class Plugins extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/expert/compiler/plugins.html")
    }

}

export default customViews.define({
    name : "expert-compiler-plugins",
    class : Plugins
})