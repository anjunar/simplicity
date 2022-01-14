import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import {contentManager} from "../../manager/content-manager.js";
import {lifeCycle} from "../../processors/life-cycle-processor.js";

class MatTabs extends HTMLElement {

    page = 0;

    get tabs() {
        let container = contentManager.instance(this);
        return Array.from(container.querySelectorAll("mat-tab"))
    }

    rendered(children) {
        for (const child of children) {
            let tab = child.querySelector("mat-tab")
            tab.selected = false;
            tab.addEventListener("click", (event) => {
                event.stopPropagation();
                for (const child of children) {
                    let tab = child.querySelector("mat-tab")
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
            let tab = child.querySelector("mat-tab")
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