import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomForm from "../../../library/simplicity-core/directives/dom-form.js";
import DomInput from "../../../library/simplicity-core/directives/dom-input.js";
import MatInputContainer from "../../../library/simplicity-material/components/form/container/mat-input-container.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";

class Form extends HTMLElement {

    person = {
        firstName: "Max",
        lastName: "Mustermann",
        address: {
            street: "Somestreet",
            state: "Somewere"
        }
    }

    simpleForm;
    form;

    initialize() {
        this.form.addAsyncValidator({
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
        return [DomForm, DomInput, MatInputContainer, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/form.html")
    }

}

export default customViews.define({
    name : "form-form",
    class : Form
})