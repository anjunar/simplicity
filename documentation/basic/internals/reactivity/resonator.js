import {customViews} from "../../../../library/simplicity/simplicity.js";
import DomCode from "../../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../../library/simplicity/util/loader.js";

class Resonator extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/internals/reactivity/resonator.html")
    }

}

export default customViews.define({
    name : "reactivity-resonator",
    class : Resonator
})