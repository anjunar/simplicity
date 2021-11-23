import {customViews} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomTextarea from "../../../../directives/dom-textarea.js";

class TextDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomTextarea]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/dialog/text-dialog.html")
    }

}

export default customViews.define({
    name: "text-dialog",
    class: TextDialog
});