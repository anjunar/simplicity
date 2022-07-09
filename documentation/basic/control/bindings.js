import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";

class CommonBindings extends HTMLElement {

    showDisplay = false;
    showClass = false;

    static get components() {
        return [DomCode];
    }

    static get template() {
        return loader("documentation/basic/control/bindings.html")
    }

}

export default customViews.define({
    name: "control-structures-bindings",
    class: CommonBindings
});