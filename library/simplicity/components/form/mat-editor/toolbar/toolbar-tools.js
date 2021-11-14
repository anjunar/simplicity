import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";

class ToolbarTools extends HTMLElement {

    content;

    copyClick() {
        this.dispatchEvent(new CustomEvent("copy"))
    }

    cutClick() {
        this.dispatchEvent(new CustomEvent("cut"))
    }

    undoClick() {
        this.dispatchEvent(new CustomEvent("undo"))
    }

    deleteClick() {
        this.dispatchEvent(new CustomEvent("delete"))
    }

    selectAllClick() {
        this.dispatchEvent(new CustomEvent("selectall"))
    }

    redoClick() {
        this.dispatchEvent(new CustomEvent("redo"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "content" : {
                this.content = newValue;
            }
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [{
            name : "content",
            type : "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-tools.html")
    }

}

export default customComponents.define("toolbar-tools", ToolbarTools);