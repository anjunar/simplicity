import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import MatCheckboxContainer from "../../../library/simplicity/components/form/container/mat-checkbox-container.js";
import DomIf from "../../../library/simplicity/directives/dom-if.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Checkbox extends HTMLElement {

    checked = false;

    static get components() {
        return [DomInput, DomIf, DomCode, MatCheckboxContainer]
    }

    static get template() {
        return loader("documentation/basic/form/checkbox.html")
    }
}

export default customViews.define({
    name: "form-checkbox",
    class: Checkbox
})