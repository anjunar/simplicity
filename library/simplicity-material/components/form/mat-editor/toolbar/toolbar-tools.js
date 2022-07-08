import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";

class ToolbarTools extends HTMLElement {

    contents;

    copy = {
        click() {
            document.execCommand("copy")
        }
    }

    cut = {
        click() {
            document.execCommand("cut")
        }
    }

    undo = {
        click() {
            document.execCommand("undo")
        }
    }

    delete = {
        click() {
            document.execCommand("delete")
        }
    }

    selectAll = {
        click() {
            document.execCommand("selectALl")
        }
    }

    redo = {
        click() {
            document.execCommand("redo")
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [{
            name : "contents",
            binding : "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/toolbar/toolbar-tools.html")
    }

}

export default customComponents.define("toolbar-tools", ToolbarTools);