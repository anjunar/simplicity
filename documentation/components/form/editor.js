import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import MatEditor from "../../../library/simplicity/components/form/mat-editor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Editor extends HTMLElement {

    value = {
        html : "Place your text here",
        text : "Place your text here"
    }

    static get components() {
        return [MatEditor, DomCode]
    }

    static get template() {
        return loader("documentation/components/form/editor.html")
    }

}

export default customViews.define({
    name: "form-editor",
    class: Editor
})