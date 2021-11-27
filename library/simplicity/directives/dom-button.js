import {customComponents} from "../simplicity.js";

class DomButton extends HTMLButtonElement {

    action;

    initialize() {
        this.addEventListener("click", () => {
            import("../services/window-manager.js")
                .then((result) => {
                    result.windowManager.openWindow(this.action);
                })
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "action" : {
                this.action = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "action",
                type: "two-way"
            }
        ]
    }

}

export default customComponents.define("dom-button", DomButton, {extends : "button"})