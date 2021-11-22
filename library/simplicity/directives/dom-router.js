import {customComponents} from "../simplicity.js";
import {viewManager} from "../services/view-manager.js";
import {lifeCycle} from "../processors/life-cycle-processor.js";

class DomRouter extends HTMLElement {

    level = 0

    constructor() {
        super();
        this.style.display = "block"
        this.handler = function (event) {
            viewManager.load(event?.newURL || window.location.hash, this.level)
                .then((view) => {
                    for (const child of Array.from(this.children)) {
                        child.remove();
                    }
                    this.appendChild(view);
                })
        }.bind(this);
    }

    initialize() {
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