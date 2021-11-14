import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomForm from "../../../library/simplicity/directives/dom-form.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Form extends HTMLElement {

    person = {
        firstName : "Max"
    }

    form;

    static get components() {
        return [DomForm, DomInput, MatInputContainer, DomCode]
    }

    static get template() {
        return loader("documentation/basic/form/form.html")
    }

}

export default customViews.define({
    name : "form-form",
    class : Form
})