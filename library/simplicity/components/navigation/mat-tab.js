import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";

class MatTab extends HTMLElement {

    selected = false;

    initialize() {
        let matTabs = this.queryUpwards((node) => {
            return node.localName === "mat-tabs";
        })

        matTabs.register(this);
    }

    static get components() {
        return [DomSlot]
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-tab.html")
    }

}

export default customComponents.define("mat-tab", MatTab)