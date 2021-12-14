import {customComponents} from "../../simplicity.js";
import DomRepeat from "../../directives/dom-repeat.js";
import {loader} from "../../processors/loader-processor.js";
import {windowManager} from "../../manager/window-manager.js";

class MatTaskbar extends HTMLElement {

    get tasks() {
        return windowManager.configurations;
    }

    onClick(task) {
        windowManager.show(task.window)
    }

    static get components() {
        return [DomRepeat]
    }

    static get template() {
        return loader("library/simplicity/components/system/mat-taskbar.html")
    }

}

export default customComponents.define("mat-taskbar", MatTaskbar);