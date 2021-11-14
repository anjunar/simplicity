import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class CustomView extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/advanced/common/custom-view.html");
    }

}

export default customViews.define({
    name: "common-custom-view",
    class: CustomView
})