import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import MatTable from "../../../library/simplicity-material/components/table/mat-table.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";

class Table extends HTMLElement {

    materials(query, callback) {
        fetch("materials.json")
            .then(response => response.json())
            .then((response) => {
                let filter;

                if (query.search) {
                    filter = response.rows.filter(row => String(row[query.search.path]).startsWith(query.search.value));
                } else {
                    filter = response.rows;
                }

                let result = filter.slice(query.index, query.index + query.limit);
                callback(result, response.rows.length)
            })
    }

    static get components() {
        return [MatTable, DomCode]
    }

    static get template() {
        return loader("documentation/components/tables/table.html")
    }

}

export default customViews.define({
    name: "documentation-table", class: Table
})