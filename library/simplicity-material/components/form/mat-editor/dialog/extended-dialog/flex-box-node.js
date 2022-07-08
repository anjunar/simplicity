import {customComponents} from "../../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../../../../simplicity-core/directives/dom-select.js";

class FlexBoxNode extends HTMLElement {

    node;

    flexDirection = {
        value : "",
        click : (event) => {
            this.node.style.flexDirection = event.target.value
        }
    };

    flexWrap = {
        value : "",
        click : (event) => {
            this.node.style.flexWrap = event.target.value
        }
    }

    justifyContent = {
        value : "",
        click : (event) => {
            this.node.style.justifyContent = event.target.value
        }
    }

    alignItems = {
        value : "",
        click : (event) => {
            this.node.style.alignItems = event.target.value
        }
    }

    alignContent = {
        value : "",
        click : (event) => {
            this.node.style.alignContent = event.target.value
        }
    }

    gap = {
        value : "",
        click : (event) => {
            this.node.style.gap = event.target.value
        }
    }

    initialize() {
        let computedStyle = window.getComputedStyle(this.node);

        this.flexDirection.value = computedStyle.flexDirection;
        this.flexWrap.value = computedStyle.flexWrap;
        this.justifyContent.value = computedStyle.justifyContent;
        this.alignItems.value = computedStyle.alignItems;
        this.alignContent.value = computedStyle.alignContent;
        this.gap.value = computedStyle.gap;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "node" : {
                this.node = newValue;
            }
        }
    }

    static get components() {
        return [DomSelect]
    }

    static get observedAttributes() {
        return [{
            name: "node",
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/dialog/extended-dialog/flex-box-node.html")
    }

}

export default customComponents.define("flex-box-node", FlexBoxNode);