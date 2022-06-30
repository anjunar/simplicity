import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomRouter from "../../../library/simplicity-core/directives/dom-router.js";

class Router extends HTMLElement {

    static get components() {
        return [DomCode, DomRouter]
    }

    static get template() {
        return loader("documentation/components/navigation/router.html")
    }

}

export default customViews.define({
    name: "navigation-router",
    class: Router
})