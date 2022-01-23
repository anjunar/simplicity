import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";

class CustomComponent extends HTMLElement {

    text = "Hello World!"

    static get components() {
        return [DomCode, DomInput]
    }

    static get template() {
        return loader("documentation/basic/architecture/custom-component.html")
    }

}

export default customViews.define({
    name: "architecture-custom-component",
    class: CustomComponent
})