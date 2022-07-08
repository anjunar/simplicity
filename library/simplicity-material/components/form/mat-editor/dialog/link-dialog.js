import {customViews} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
import DomInput from "../../../../../simplicity-core/directives/dom-input.js";
import MatInputContainer from "../../container/mat-input-container.js";

class LinkDialog extends HTMLElement {

    value = "";

    static get components() {
        return [DomInput, MatInputContainer]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/dialog/link-dialog.html")
    }

}

export default customViews.define({
    name: "link-dialog",
    class: LinkDialog,
    header: "Link Dialog"
})