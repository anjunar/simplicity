import {customViews} from "../../../simplicity/simplicity.js";
import MatTabs from "../navigation/mat-tabs.js";
import MatTab from "../navigation/mat-tab.js";
import MatPages from "../navigation/mat-pages.js";
import MatPage from "../navigation/mat-page.js";
import DomInput from "../../../simplicity/directives/dom-input.js";
import MatCheckboxContainer from "../form/container/mat-checkbox-container.js";
import MatTable from "./mat-table.js";
import {libraryLoader} from "../../util/loader.js";

class MatTableConfiguration extends HTMLElement {

    table;

    left(event, index) {
        event.stopPropagation();
        this.table.left(index);
        let table = this.querySelector("mat-table");
        table.load();
        return false;
    }

    right(event, index) {
        event.stopPropagation();
        this.table.right(index);
        let table = this.querySelector("mat-table");
        table.load();
        return false;
    }

    tableColumns(query, callback) {
        callback(this.table.columns.slice(query.index, query.index + query.limit), this.table.columns.length);
    }

    static get components() {
        return [DomInput, MatTabs, MatTab, MatPages, MatPage, MatCheckboxContainer, MatTable]
    }

    static get template() {
        return libraryLoader("simplicity/components/table/mat-table-configuration.html")
    }
}

export default customViews.define({
    name : "mat-table-configuration",
    class : MatTableConfiguration,
    header : "Table Configuration"
})