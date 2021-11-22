import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import MatInputContainer from "../../container/mat-input-container.js";
import DomInput from "../../../../directives/dom-input.js";

class ToolbarFlexbox extends HTMLElement {

    contents;

    columns = 2;

    initialize() {
        let handler = () => {

        };

        this.contents.addEventListener("click", handler);

        ToolbarFlexbox.prototype.destroy = () => {
            this.contents.removeEventListener("click", handler);
        }
    }

    insertDivFlexClick(columns) {
        this.dispatchEvent(new CustomEvent("insertdivflex", {detail : {columns : this.columns}}))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return [MatInputContainer, DomInput]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-flexbox.html")
    }


}

export default customComponents.define("toolbar-flexbox", ToolbarFlexbox)