import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import MatInputContainer from "../../../library/simplicity/components/form/container/mat-input-container.js"
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

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
        return [DomCode, DomInput, MatInputContainer]
    }

    static get template() {
        return loader("documentation/components/form/input.html")
    }

}

export default customViews.define({
    name : "form-input",
    class : Input
})