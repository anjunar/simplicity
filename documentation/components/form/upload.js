import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import MatImageUpload from "../../../library/simplicity/components/form/mat-image-upload.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

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