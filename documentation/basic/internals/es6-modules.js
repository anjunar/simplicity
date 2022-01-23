import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class Es6Modules extends HTMLElement {

    static get template() {
        return loader("documentation/basic/internals/es6-modules.html")
    }

}

export default customViews.define({
    name : "internals-es6-modules",
    class : Es6Modules
})