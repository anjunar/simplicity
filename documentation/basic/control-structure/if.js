import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";

class If extends HTMLElement {

    page = 0;
    show = true;

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/control-structure/if.html")
    }

}

export default customViews.define({
    name: "control-structures-if",
    class: If
})