import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js"
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Input extends HTMLElement {

    firstName = "Max";

    static get components() {
        return [MatInputContainer, DomInput, DomCode]
    }

    static get template() {
        return loader("documentation/basic/form/input.html")
    }

}

export default customViews.define({
    name : "form-input",
    class : Input
})