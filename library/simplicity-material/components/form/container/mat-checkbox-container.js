import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../simplicity-core/processors/loader-processor.js";

class MatCheckboxContainer extends HTMLElement {

    placeholder = "";

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "placeholder" : {
                this.placeholder = newValue;
            }
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [{
            name: "placeholder",
            binding: "input"
        }];
    }

    static get template() {
        return loader("library/simplicity-material/components/form/container/mat-checkbox-container.html")
    }

}

export default customComponents.define("mat-checkbox-container", MatCheckboxContainer)