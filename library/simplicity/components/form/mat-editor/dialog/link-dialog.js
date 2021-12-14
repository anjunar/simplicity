import {customViews} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomInput from "../../../../directives/dom-input.js";
import MatInputContainer from "../../container/mat-input-container.js";

class LinkDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomInput, MatInputContainer]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/dialog/link-dialog.html")
    }

}

export default customViews.define({
    name: "link-dialog",
    class: LinkDialog,
    header: "Link Dialog"
})