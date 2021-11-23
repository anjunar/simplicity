import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomInput from "../../../../directives/dom-input.js";
import MatInputContainer from "../../container/mat-input-container.js";
import DomSelect from "../../../../directives/dom-select.js";

class ToolbarTable extends HTMLElement {

    contents;

    columns = {
        value : 2
    };
    rows = {
        value : 2
    };

    insertTable = {
        click : (columns, rows) => {
            let columnsHTML = "";
            for (let i = 0; i < columns; i++) {
                columnsHTML += "<td></td>"
            }

            let rowsHTML = "";
            for (let i = 0; i < rows; i++) {
                rowsHTML += "<tr>" + columnsHTML + "</tr>"
            }

            let table = "<table><tbody>" + rowsHTML + "</tbody></table>";

            document.execCommand("insertHTML", false, table)
        }
    }

    addColumn = {
        disabled : true,
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);

            let node = rangeAt.commonAncestorContainer;
            let table = node.queryUpwards((node) => node.localName === "table")
            let rows = table.querySelectorAll("tr");
            for (const row of rows) {
                row.appendChild(document.createElement("td"))
            }
        },
        handler : (event) => {
            let tableElement = event.path.find((segment) => segment.localName === "table");
            this.addColumn.disabled = !tableElement;
        }
    }
    addRow = {
        disabled : true,
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let table = node.queryUpwards((node) => node.localName === "table")
            let tbody = table.querySelector("tbody");
            let trBody = tbody.querySelector("tr")
            let columns = trBody.querySelectorAll("td");

            let tr = document.createElement("tr");
            for (let i = 0; i < columns.length; i++) {
                tr.appendChild(document.createElement("td"))
            }
            tbody.appendChild(tr)
        },
        handler : (event) => {
            let tableElement = event.path.find((segment) => segment.localName === "table");
            this.addRow.disabled = !tableElement;
        }
    }

    removeColumn = {
        disabled : true,
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let table = node.queryUpwards((node) => node.localName === "table")
            let rows = table.querySelectorAll("tr");
            for (const row of rows) {
                let tds = row.querySelectorAll("td");
                tds.item(tds.length - 1).remove();
            }
        },
        handler : (event) => {
            let tableElement = event.path.find((segment) => segment.localName === "table");
            this.removeColumn.disabled = !tableElement;
        }
    }
    removeRow = {
        disabled : true,
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let table = node.queryUpwards((node) => node.localName === "table")
            let trs = table.querySelectorAll("tr");
            trs.item(trs.length - 1).remove();
        },
        handler : (event) => {
            let tableElement = event.path.find((segment) => segment.localName === "table");
            this.removeRow.disabled = !tableElement;
        }
    }

    inputs = [this.addColumn, this.addRow, this.removeColumn, this.removeRow];

    initialize() {
        let handler = (event) => {
            for (const input of this.inputs) {
                input.handler(event)
            }
        }

        this.contents.addEventListener("click", handler);

        ToolbarTable.prototype.destroy = () => {
            this.contents.removeEventListener("click", handler);
        }
    }

    insertTableClick(columns, rows) {
        this.dispatchEvent(new CustomEvent("inserttable", {detail : {columns : columns, rows : rows}}))
    }

    addTableColumnClick() {
        this.dispatchEvent(new CustomEvent("addtablecolumn"))
    }

    addTableRowClick() {
        this.dispatchEvent(new CustomEvent("addtablerow"))
    }

    removeTableColumnClick() {
        this.dispatchEvent(new CustomEvent("removetablecolumn"))
    }

    removeTableRowClick() {
        this.dispatchEvent(new CustomEvent("removetablerow"))
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