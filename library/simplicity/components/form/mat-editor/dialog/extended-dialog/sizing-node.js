import {customComponents} from "../../../../../simplicity.js";
import DomInput from "../../../../../directives/dom-input.js";
import MatInputContainer from "../../../container/mat-input-container.js";
import {loader} from "../../../../../processors/loader-processor.js";

class SizingNode extends HTMLElement {

    node;

    sizeX;
    sizeY

    initialize() {
        let computedStyle = window.getComputedStyle(this.node);
        this.sizeX = computedStyle.width;
        this.sizeY = computedStyle.height;
    }

    sizeXChange(event) {
        this.node.style.width = event.target.value;
    }

    sizeYChange(event) {
        this.node.style.height = event.target.value;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "node" : {
                this.node = newValue;
            }
        }
    }

    static get components() {
        return [DomInput, MatInputContainer]
    }

    static get observedAttributes() {
        return [{
            name: "node",
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/dialog/extended-dialog/sizing-node.html")
    }

}

export default customComponents.define("sizing-node", SizingNode);