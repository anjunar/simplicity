import {customComponents} from "../../simplicity.js";
import DomSlot from "../../directives/dom-slot.js";
import {loader} from "../../processors/loader-processor.js";
import DomRepeat from "../../directives/dom-repeat.js";

class MatTabs extends HTMLElement {

    page = 0;

    get tabs() {
        return Array.from(this.content.querySelectorAll("mat-tab"));
    }

    render() {
        let tabs = Array.from(this.querySelectorAll("mat-tab"));
        for (const tab of tabs) {
            tab.selected = false;
        }
        let tab = tabs[this.page];
        tab.selected = true;
    }

    register(tab) {
        tab.addEventListener("click", (event) => {
            event.stopPropagation();
            let tabs = Array.from(this.querySelectorAll("mat-tab"));

            for (const tab of tabs) {
                tab.selected = false;
            }
            tab.selected = true;
            this.page = tabs.indexOf(tab);
            this.dispatchEvent(new CustomEvent("page"))
            return false;
        })
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
        return [DomSlot, DomRepeat]
    }

    static get template() {
        return loader("library/simplicity/components/navigation/mat-tabs.html")
    }
}

export default customComponents.define("mat-tabs", MatTabs);