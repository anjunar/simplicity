import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomRouter from "../../../library/simplicity/directives/dom-router.js";

class Router extends HTMLElement {

    static get components() {
        return [DomCode, DomRouter]
    }

    static get template() {
        return loader("documentation/basic/navigation/router.html")
    }

}

export default customViews.define({
    name: "navigation-router",
    class: Router
})