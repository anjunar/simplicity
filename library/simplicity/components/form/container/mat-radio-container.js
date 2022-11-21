import {customComponents} from "../../../../simplicity/simplicity.js";
import {libraryLoader} from "../../../util/loader.js";

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
        return libraryLoader("simplicity/components/form/container/mat-radio-container.html")
    }

}

export default customComponents.define("mat-radio-container", MatRadioContainer)