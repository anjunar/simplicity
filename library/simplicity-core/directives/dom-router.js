import {customComponents} from "../simplicity.js";
import {viewManager} from "../manager/view-manager.js";

class DomRouter extends HTMLElement {

    level = 0

    handler = (event) => {
        this.dispatchEvent(new CustomEvent("load"))

        let runViewManager = (url) => {
            viewManager.load(url, this.level, false)
                .then((view) => {
                    for (const child of Array.from(this.children)) {
                        child.remove();
                    }
                    this.appendChild(view);
                    let nextLevelRouter = this.querySelector("dom-router");
                    if (nextLevelRouter) {
                        nextLevelRouter.addEventListener("loadend", () => {
                            this.dispatchEvent(new CustomEvent("loadend"))
                        })
                    } else {
                        this.dispatchEvent(new CustomEvent("loadend"))
                    }
                })
        }

        if (event) {
            let oldUrlSegments = event.oldURL.split("#");
            let newUrlSegments = event.newURL.split("#");

            if (oldUrlSegments[this.level + 1] !== newUrlSegments[this.level + 1]) {
                runViewManager(event.newURL);
            }
        } else {
            runViewManager(window.location.hash);
        }
    }

    destroy() {
        window.removeEventListener("hashchange", this.handler)
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
                binding: "input"
            }
        ]
    }

}

export default customComponents.define("dom-router", DomRouter);