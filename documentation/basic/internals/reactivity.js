import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Reactivity extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/internals/reactivity.html")
    }

}

export default customViews.define({
    name : "internals-reactivity",
    class : Reactivity
})