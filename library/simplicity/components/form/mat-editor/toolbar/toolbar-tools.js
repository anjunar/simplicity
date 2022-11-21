import {customComponents} from "../../../../../simplicity/simplicity.js";
import {libraryLoader} from "../../../../util/loader.js";

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

    delete1 = {
        click() {
            document.execCommand("removeFormat")
        }
    }

    selectAll = {
        click : () => {
            let range = document.createRange();
            range.selectNodeContents(this.contents);
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(range);
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
                if (newValue) {
                    this.contents = newValue;
                }
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
        return libraryLoader("simplicity/components/form/mat-editor/toolbar/toolbar-tools.html")
    }

}

export default customComponents.define("toolbar-tools", ToolbarTools);