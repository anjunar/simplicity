import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import {contentManager} from "../../manager/content-manager.js";
import {membraneFactory} from "../../processors/html-compiler-processor.js";

class MatTabs extends HTMLElement {

    page = 0;
    container;

    tabs() {
        let method = () => {
            return Array.from(this.container.querySelectorAll("mat-tab"))
        }
        let resonator = (callback, element) => {
            let mutationObserver = new MutationObserver(() => {
                callback();
                this.dispatchEvent(new CustomEvent("page"))
            })

            mutationObserver.observe(this.resolve.container, {subtree : true, childList : true})

            element.addEventListener("removed", () => {
                mutationObserver.disconnect();
            })
        }
        return {method, resonator}
    }

    preInitialize() {
        this.container = contentManager.instance(this);
    }

    rendered(children) {
        for (const child of children) {
            let tab = membraneFactory(child.querySelector("mat-tab"))
            tab.selected = false;
            tab.addEventListener("click", (event) => {
                event.stopPropagation();
                for (const child of children) {
                    let tab = membraneFactory(child.querySelector("mat-tab"))
                    tab.selected = false;
                }
                tab.selected = true;
                this.page = children.indexOf(child);
                this.dispatchEvent(new CustomEvent("page"))
                return false;
            })
        }
        if (children.length > 0) {
            let child = children[this.page];
            let tab = membraneFactory(child.querySelector("mat-tab"))
            tab.selected = true;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "page" : {
                this.page = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "page",
                type: "two-way"
            }
        ]
    }

    static get components() {
        return []
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-tabs.html")
    }
}

export default customComponents.define("mat-tabs", MatTabs);