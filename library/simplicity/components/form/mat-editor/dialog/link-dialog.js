import {customViews} from "../../../../../simplicity/simplicity.js";
import DomInput from "../../../../../simplicity/directives/dom-input.js";
import MatInputContainer from "../../container/mat-input-container.js";
import {libraryLoader} from "../../../../util/loader.js";

class LinkDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomInput, MatInputContainer]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/dialog/link-dialog.html")
    }

}

export default customViews.define({
    name: "link-dialog",
    class: LinkDialog,
    header: "Link Dialog"
})