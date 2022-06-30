import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomSelect from "../../../library/simplicity-core/directives/dom-select.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";

class Select extends HTMLElement {

    car = "bmw"

    static get components() {
        return [DomSelect, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/select.html")
    }

}

export default customViews.define({
    name : "form-select",
    class : Select
})