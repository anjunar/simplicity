import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class WebComponents extends HTMLElement {

    static get template() {
        return loader("documentation/basic/internals/web-components.html")
    }

}

export default customViews.define({
    name : "internals-web-components",
    class : WebComponents
})