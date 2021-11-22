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

    removeColumnButton;
    removeRowButton;

    initialize() {
        let handler = (event) => {
            event.stopPropagation();
            let tableElement = event.path.find((segment) => segment.localName === "table");
            if (tableElement) {
                this.addColumnButton.removeAttribute("disabled");
                this.addRowButton.removeAttribute("disabled");
                this.removeColumnButton.removeAttribute("disabled");
                this.removeRowButton.removeAttribute("disabled")
            } else {
                this.addColumnButton.setAttribute("disabled", "true")
                this.addRowButton.setAttribute("disabled", "true")
                this.removeColumnButton.setAttribute("disabled", "true")
                this.removeRowButton.setAttribute("disabled", "true")
            }
        };

        this.handler = this.contents.addEventListener("click", handler)

        ToolbarTable.prototype.destroy = () => {
            this.contents.removeEventListener("click", handler);
        }
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

    removeColumnClick() {
        this.dispatchEvent(new CustomEvent("removecolumn"))
    }

    removeRowClick() {
        this.dispatchEvent(new CustomEvent("removerow"))
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