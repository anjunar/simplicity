import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class DirtyChecking extends HTMLElement {

    static get template() {
        return loader("documentation/basic/internals/dirty-checking.html")
    }

}

export default customViews.define({
    name : "internals-dirty-checking",
    class : DirtyChecking
})