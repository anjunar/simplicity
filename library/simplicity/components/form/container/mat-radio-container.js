import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";

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
            type : "input"
        }];
    }

    static get template() {
        return loader("library/simplicity/components/form/container/mat-radio-container.html")
    }

}

export default customComponents.define("mat-radio-container", MatRadioContainer)