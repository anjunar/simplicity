import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class Proxy extends HTMLElement {

    static get template() {
        return loader("documentation/basic/internals/proxy.html")
    }

}

export default customViews.define({
    name : "internals-proxy",
    class : Proxy
})