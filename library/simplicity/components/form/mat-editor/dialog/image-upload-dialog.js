import {customViews} from "../../../../../simplicity/simplicity.js";
import MatImageUpload from "../../mat-image-upload.js";
import {libraryLoader} from "../../../../util/loader.js";

class ImageUploadDialog extends HTMLElement {

    value = {
        data: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        name: ""
    }

    static get components() {
        return [MatImageUpload]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/dialog/image-upload-dialog.html")
    }

}

export default customViews.define({
    name: "image-upload-dialog",
    class: ImageUploadDialog
})