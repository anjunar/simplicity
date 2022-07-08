import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import {windowManager} from "../../manager/window-manager.js";

class MatTaskbar extends HTMLElement {

    get tasks() {
        let method = () => {
            return windowManager.configurations;
        }
        let resonator = (callback, element) => {
            window.addEventListener("window", callback)

            element.addEventListener("removed", () => {
                window.removeEventListener("window", callback)
            })
        }
        return {method, resonator}
    }

    onClick(task) {
        windowManager.show(task.window)
    }

    static get components() {
        return []
    }

    static get template() {
        return libraryLoader("simplicity-material/components/system/mat-taskbar.html")
    }

}

export default customComponents.define("mat-taskbar", MatTaskbar);