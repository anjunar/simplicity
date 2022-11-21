import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class If extends HTMLElement {

    page = 0;
    show = true;

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/control/if.html")
    }

}

export default customViews.define({
    name: "control-structures-if",
    class: If
})