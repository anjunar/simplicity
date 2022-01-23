import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class CommonBindings extends HTMLElement {

    showDisplay = false;
    showClass = false;

    static get components() {
        return [DomCode];
    }

    static get template() {
        return loader("documentation/basic/control-structure/bindings.html")
    }

}

export default customViews.define({
    name: "control-structures-bindings",
    class: CommonBindings
});