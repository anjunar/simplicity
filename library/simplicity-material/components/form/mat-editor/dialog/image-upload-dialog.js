import {customViews} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
import MatImageUpload from "../../mat-image-upload.js";

class ImageUploadDialog extends HTMLElement {

    value = {
        data: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        name: ""
    }

    static get components() {
        return [MatImageUpload]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/dialog/image-upload-dialog.html")
    }

}

export default customViews.define({
    name: "image-upload-dialog",
    class: ImageUploadDialog
})