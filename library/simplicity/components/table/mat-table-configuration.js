import {customViews} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import MatTabs from "../navigation/mat-tabs.js";
import MatTab from "../navigation/mat-tab.js";
import MatPages from "../navigation/mat-pages.js";
import MatPage from "../navigation/mat-page.js";
import DomInput from "../../directives/dom-input.js";
import MatCheckboxContainer from "../form/container/mat-checkbox-container.js";

class MatTableConfiguration extends HTMLElement {

    table;
    page = 0;

    left(event, index) {
        event.stopPropagation();
        this.page--
        this.table.left(index)
        return false;
    }

    right(event, index) {
        event.stopPropagation();
        this.page++;
        this.table.right(index);
        return false;
    }

    static get components() {
        return [DomInput, MatTabs, MatTab, MatPages, MatPage, MatCheckboxContainer]
    }

    static get template() {
        return loader("library/simplicity/components/table/mat-table-configuration.html")
    }
}

export default customViews.define({
    name : "mat-table-configuration",
    class : MatTableConfiguration,
    header : "Table Configuration"
})