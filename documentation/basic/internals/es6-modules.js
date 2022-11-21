import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class Es6Modules extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/internals/es6-modules.html")
    }

}

export default customViews.define({
    name : "internals-es6-modules",
    class : Es6Modules
})