import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class Membrane extends HTMLElement {

    static get template() {
        return loader("documentation/basic/internals/membrane.html")
    }

}

export default customViews.define({
    name : "internals-membrane",
    class : Membrane
})