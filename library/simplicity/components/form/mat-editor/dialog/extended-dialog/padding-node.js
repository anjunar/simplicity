import {customComponents} from "../../../../../../simplicity/simplicity.js";
import DomInput from "../../../../../../simplicity/directives/dom-input.js";
import MatInputContainer from "../../../container/mat-input-container.js";
import {libraryLoader} from "../../../../../util/loader.js";

class PaddingNode extends HTMLElement {

    node

    paddingLeft
    paddingRight
    paddingTop
    paddingBottom

    initialize() {
        let regex = /(\d+).*/
        let computedStyle = window.getComputedStyle(this.node);
        this.paddingLeft = Number.parseInt(regex.exec(computedStyle.paddingLeft)[1])
        this.paddingRight = Number.parseInt(regex.exec(computedStyle.paddingRight)[1])
        this.paddingTop = Number.parseInt(regex.exec(computedStyle.paddingTop)[1])
        this.paddingBottom = Number.parseInt(regex.exec(computedStyle.paddingBottom)[1])
    }

    paddingLeftChange(event) {
        this.node.style.paddingLeft = event.target.value + "px";
    }

    paddingRightChange(event) {
        this.node.style.paddingRight = event.target.value + "px";
    }

    paddingTopChange(event) {
        this.node.style.paddingTop = event.target.value + "px";
    }

    paddingBottomChange(event) {
        this.node.style.paddingBottom = event.target.value + "px";
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
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/dialog/extended-dialog/padding-node.html")
    }


}

export default customComponents.define("padding-node", PaddingNode)