import {customViews} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import {windowManager} from "../../../manager/window-manager.js";

class ContextMenu extends HTMLElement {

    isCollapsed = true;
    path;

    initialize() {
        let selection = window.getSelection();
        this.isCollapsed = selection.isCollapsed;
    }

    cut() {
        document.execCommand("cut")
    }

    copy() {
        document.execCommand("copy")
    }

    paste() {
        document.execCommand("paste")
    }

    extension() {
        windowManager.openWindow("/library/simplicity/components/form/mat-editor/dialog/extended-dialog", {
            data: {
                path: this.path
            }
        })
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/context-menu.html")
    }

}

export default customViews.define({
    name: "context-menu",
    class: ContextMenu
})