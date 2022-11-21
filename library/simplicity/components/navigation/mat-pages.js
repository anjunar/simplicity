import {customComponents} from "../../../simplicity/simplicity.js";
import {libraryLoader} from "../../util/loader.js";

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
        return libraryLoader("simplicity/components/navigation/mat-pages.html");
    }
}

export default customComponents.define("mat-pages", MatPages);