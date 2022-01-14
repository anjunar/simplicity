import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class If extends HTMLElement {

    page = 0;
    show = true;

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/common/if.html")
    }

}

export default customViews.define({
    name: "common-if",
    class: If
})