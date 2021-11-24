import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";

class MatContextMenu extends HTMLElement {

    initialize() {
        this.addEventListener("click", (event) => {
            event.stopPropagation();
            return false;
        })

        let listener = () => {
            this.remove();
        };

        window.addEventListener("click", listener)

        MatContextMenu.prototype.destroy = () => {
            window.removeEventListener("click", listener);
        }
    }

    static get components() {
        return [DomSlot]
    }

    static get template() {
        return loader("library/simplicity/components/modal/mat-context-menu.html")
    }

}

export default customComponents.define("mat-context-menu", MatContextMenu)