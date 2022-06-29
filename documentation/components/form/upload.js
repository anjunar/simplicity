import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import MatImageUpload from "../../../library/simplicity-material/components/form/mat-image-upload.js";
import DomCode from "../../../library/simplicity-code/directives/dom-code.js";

class Upload extends HTMLElement {

    image = {
        data : "",
        name : ""
    }

    static get components() {
        return [MatImageUpload, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/upload.html")
    }

}

export default customViews.define({
    name : "form-upload",
    class : Upload
})