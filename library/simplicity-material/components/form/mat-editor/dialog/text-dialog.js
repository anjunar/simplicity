import {customViews} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
import DomTextarea from "../../../../../simplicity-core/directives/dom-textarea.js";

class TextDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomTextarea]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/dialog/text-dialog.html")
    }

}

export default customViews.define({
    name: "text-dialog",
    class: TextDialog
});