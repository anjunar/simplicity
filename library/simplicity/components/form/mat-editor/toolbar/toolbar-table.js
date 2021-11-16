import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomInput from "../../../../directives/dom-input.js";
import MatInputContainer from "../../container/mat-input-container.js";

class ToolbarTable extends HTMLElement {

    contents;

    columns = 2;
    rows = 2;

    addColumnButton;
    addRowButton;

    initialize() {
        this.contents.addEventListener("click", (event) => {
            event.stopPropagation();
            let tableElement = event.path.find((segment) => segment.localName === "table");
            if (tableElement) {
                this.addColumnButton.removeAttribute("disabled")
                this.addRowButton.removeAttribute("disabled")
            } else {
                this.addColumnButton.setAttribute("disabled", "true")
                this.addRowButton.setAttribute("disabled", "true")
            }
        })
    }

    insertTableClick(columns, rows) {
        this.dispatchEvent(new CustomEvent("inserttable", {detail : {columns : columns, rows : rows}}))
    }

    addColumnClick() {
        this.dispatchEvent(new CustomEvent("addcolumn"))
    }

    addRowClick() {
        this.dispatchEvent(new CustomEvent("addrow"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return [DomInput, MatInputContainer]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-table.html")
    }

}

export default customComponents.define("toolbar-table", ToolbarTable);