import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import DomForm from "../../../library/simplicity/directives/dom-form.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class ValidationInput extends HTMLElement {

    input;
    text = ""

    initialize() {
        this.input.addAsyncValidator({
            validate : (element) => {
                let executor = (resolve, reject) => {
                    if (element.value === "Hello World!") {
                        reject("hello");
                    } else {
                        resolve("hello");
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
        return loader("documentation/advanced/form/validation-input.html")
    }

}

export default customViews.define({
    name : "form-validation-input",
    class : ValidationInput
})