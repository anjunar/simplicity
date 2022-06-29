import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import MatInputContainer from "../../../library/simplicity-material/components/form/container/mat-input-container.js"
import DomInput from "../../../library/simplicity-core/directives/dom-input.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";
import DomForm from "../../../library/simplicity-core/directives/dom-form.js";

class Input extends HTMLElement {

    input;
    text = ""

    firstName = "Max";

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
        return loader("documentation/components/form/input.html")
    }

}

export default customViews.define({
    name : "form-input",
    class : Input
})