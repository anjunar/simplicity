import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomInput from "../../../library/simplicity-core/directives/dom-input.js";
import MatCheckboxContainer from "../../../library/simplicity-material/components/form/container/mat-checkbox-container.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";

class Checkbox extends HTMLElement {

    checked = false;

    static get components() {
        return [DomInput, DomCode, MatCheckboxContainer]
    }

    static get template() {
        return loader("documentation/components/form/checkbox.html")
    }
}

export default customViews.define({
    name: "form-checkbox",
    class: Checkbox
})