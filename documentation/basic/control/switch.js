import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Switch extends HTMLElement {

    value = "test1"

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/control/switch.html")
    }

}

export default customViews.define({
    name: "control-structures-switch",
    class: Switch
})