import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class Switch extends HTMLElement {

    value = "test1"

    static get template() {
        return loader("documentation/basic/common/switch.html")
    }

}

export default customViews.define({
    name : "common-switch",
    class : Switch
})