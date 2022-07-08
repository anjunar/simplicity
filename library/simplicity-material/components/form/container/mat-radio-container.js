import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";

class MatRadioContainer extends HTMLElement {

    placeholder = ""

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "placeholder" : {
                this.placeholder = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [{
            name : "placeholder",
            binding : "input"
        }];
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/container/mat-radio-container.html")
    }

}

export default customComponents.define("mat-radio-container", MatRadioContainer)