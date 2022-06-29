import {customComponents} from "../simplicity.js";
import {viewManager} from "../manager/view-manager.js";

class DomRouter extends HTMLElement {

    level = 0

    handler = (event) => {
        viewManager.load(event?.newURL || window.location.hash, this.level, false)
            .then((view) => {
                for (const child of Array.from(this.children)) {
                    child.remove();
                }
                this.appendChild(view);
            })

    }

    constructor() {
        super();
        DomRouter.prototype.destroy = () => {
            window.removeEventListener("hashchange", this.handler)
        }
    }

    initialize() {
        this.style.display = "block"
        window.addEventListener("hashchange", this.handler)
        this.handler();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "level" : {
                this.level = Number.parseInt(newValue);
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "level",
                type: "input"
            }
        ]
    }

}

export default customComponents.define("dom-router", DomRouter);