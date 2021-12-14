import {customComponents} from "../../../../../simplicity.js";
import DomInput from "../../../../../directives/dom-input.js";
import MatInputContainer from "../../../container/mat-input-container.js";
import {loader} from "../../../../../processors/loader-processor.js";

class SizingNode extends HTMLElement {

    node;

    sizeX = {
        value : "",
        click : (event) => {
            this.node.style.width = event.target.value;
        }
    };

    sizeY = {
        value : "",
        click : (event) => {
            this.node.style.height = event.target.value;
        }
    }

    initialize() {
        let computedStyle = window.getComputedStyle(this.node);
        this.sizeX.value = computedStyle.width;
        this.sizeY.value = computedStyle.height;
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