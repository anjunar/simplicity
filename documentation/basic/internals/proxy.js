import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class Proxy extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/internals/proxy.html")
    }

}

export default customViews.define({
    name : "internals-proxy",
    class : Proxy
})