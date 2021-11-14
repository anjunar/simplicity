import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomIf from "../../../library/simplicity/directives/dom-if.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class If extends HTMLElement {

    page = 0;
    show = true;

    static get components() {
        return [DomIf, DomCode]
    }

    static get template() {
        return loader("documentation/basic/common/if.html")
    }

}

export default customViews.define({
    name: "common-if",
    class: If
})