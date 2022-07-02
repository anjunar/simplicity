import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";

class MatPages extends HTMLElement {

    page = 0;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "page" : {
                this.page = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "page",
                binding: "input"
            }
        ]
    }

    static get components() {
        return [];
    }

    static get template() {
        return loader("library/simplicity-material/components/navigation/mat-pages.html");
    }
}

export default customComponents.define("mat-pages", MatPages);