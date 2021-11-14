import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import DomForm from "../../../library/simplicity/directives/dom-form.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class ValidationForm extends HTMLElement {

    person = {
        firstName : "Max",
        lastName:  "Mustermann"
    }

    form;

    initialize() {
        this.form.addValidator({
            validate: (element) => {
                let executor = (resolve, reject) => {
                    if (this.person.firstName === "Max" && this.person.lastName === "Mustermann") {
                        reject("naturalId");
                    } else {
                        resolve("naturalId");
                    }
                };
                return new Promise(executor);
            }
        })
    }

    static get components() {
        return [DomCode, DomInput, DomForm, MatInputContainer]
    }

    static get template() {
        return loader("documentation/advanced/form/validation-form.html")
    }

}

export default customViews.define({
    name : "form-validation-form",
    class : ValidationForm
})