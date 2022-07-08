import {customComponents} from "../../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../../simplicity-core/processors/loader-processor.js";
import DomInput from "../../../../../../simplicity-core/directives/dom-input.js";
import MatInputContainer from "../../../container/mat-input-container.js";

class MarginsNode extends HTMLElement {

    node

    marginLeft
    marginRight
    marginTop
    marginBottom

    initialize() {
        let regex = /(\d+).*/
        let computedStyle = window.getComputedStyle(this.node);
        this.marginLeft = Number.parseInt(regex.exec(computedStyle.marginLeft)[1])
        this.marginRight = Number.parseInt(regex.exec(computedStyle.marginRight)[1])
        this.marginTop = Number.parseInt(regex.exec(computedStyle.marginTop)[1])
        this.marginBottom = Number.parseInt(regex.exec(computedStyle.marginBottom)[1])
    }

    marginLeftChange(event) {
        this.node.style.marginLeft = event.target.value + "px";
    }

    marginRightChange(event) {
        this.node.style.marginRight = event.target.value + "px";
    }

    marginTopChange(event) {
        this.node.style.marginTop = event.target.value + "px";
    }

    marginBottomChange(event) {
        this.node.style.marginBottom = event.target.value + "px";
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
        return libraryLoader("simplicity-material/components/form/mat-editor/dialog/extended-dialog/margins-node.html")
    }


}

export default customComponents.define("margins-node", MarginsNode)