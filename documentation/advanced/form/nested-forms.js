import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import DomForm from "../../../library/simplicity/directives/dom-form.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class NestedForms extends HTMLElement {

    person = {
        firstName: "Max",
        lastName: "Mustermann",
        address: {
            street: "Somestreet",
            state: "Somewere"
        }
    }

    static get components() {
        return [DomCode, DomInput, DomForm, MatInputContainer]
    }

    static get template() {
        return loader("documentation/advanced/form/nested-forms.html")
    }

}

export default customViews.define({
    name: "form-nested-forms",
    class: NestedForms
})