import {customComponents} from "../simplicity.js";
import {viewManager} from "../manager/view-manager.js";
import {lifeCycle} from "../processors/life-cycle-processor.js";

class DomRouter extends HTMLElement {

    level = 0
    handler = null;

    constructor() {
        super();
        this.handler = function (event) {
            if (this.isConnected) {
                viewManager.load(event?.newURL || window.location.hash, this.level, false)
                    .then((view) => {
                        for (const child of Array.from(this.children)) {
                            child.remove();
                        }
                        this.appendChild(view);
                        lifeCycle();
                    })
            } else {
                window.removeEventListener("hashchange", this.handler)
            }
        }.bind(this);
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