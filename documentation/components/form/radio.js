import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import MatRadioContainer from "../../../library/simplicity/components/form/container/mat-radio-container.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";

class Radio extends HTMLElement {

    gender = "male"

    static get components() {
        return [DomCode, DomInput, MatRadioContainer]
    }

    static get template() {
        return loader("documentation/components/form/radio.html")
    }

}

export default customViews.define({
    name: "form-radio",
    class: Radio
})