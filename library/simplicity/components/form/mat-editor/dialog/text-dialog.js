import {customViews} from "../../../../../simplicity/simplicity.js";
import DomTextarea from "../../../../../simplicity/directives/dom-textarea.js";
import {libraryLoader} from "../../../../util/loader.js";

class TextDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomTextarea]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/dialog/text-dialog.html")
    }

}

export default customViews.define({
    name: "text-dialog",
    class: TextDialog,
    header : "Insert Text"
});