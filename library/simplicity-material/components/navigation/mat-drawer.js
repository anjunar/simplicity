import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatDrawer extends HTMLElement {

    open = false;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "open" : {
                this.open = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "open",
                type: "input"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity-material/components/navigation/mat-drawer.html")
    }

}

export default customComponents.define("mat-drawer", MatDrawer)