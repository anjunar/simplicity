import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import MetaTable from "../../../library/simplicity-material/components/meta/meta-table.js";

class Table extends HTMLElement {

    materials(query, callback) {
        fetch("materials.json")
            .then(response => response.json())
            .then((response) => {
                let filter;

                if (query.filter) {
                    filter = response.rows.filter(row => {
                        return Object.entries(query.filter).every(([property, value]) => {
                            return String(row[property]).toLowerCase().startsWith(String(value).toLowerCase())
                        })
                    });
                } else {
                    filter = response.rows;
                }

                let result = filter.slice(query.index, query.index + query.limit);
                callback(result, response.rows.length, response.$schema)
            })
    }

    static get components() {
        return [MetaTable, DomCode]
    }

    static get template() {
        return loader("documentation/expert/meta/table.html")
    }

}

export default customViews.define({
    name: "expert-meta-table",
    class: Table
})