import {customComponents} from "../simplicity.js";
import {viewManager} from "../manager/view-manager.js";

class DomRouter extends HTMLElement {

    level = 0

    handler = (event) => {
        this.dispatchEvent(new CustomEvent("load"))

        let appElement = document.querySelector("#app");
        let routes = appElement.constructor.routes;
        let urlSegments = window.location.hash.split("/").slice(1);

        let files = [];
        let cursor = routes;
        for (const urlSegment of urlSegments) {
            cursor = cursor.children[urlSegment.split("?")[0]];
            if (cursor.file) {
                if (cursor.override) {
                    files[files.length - 1] = cursor.file
                } else {
                    files.push(cursor.file)
                }
            }
        }

        let file = files[this.level]

        viewManager.load(file, this.level, false)
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