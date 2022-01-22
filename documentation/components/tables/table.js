import {customViews} from "../../../library/simplicity/simplicity.js";
import {jsonClient} from "../../../library/simplicity/services/client.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import MatTable from "../../../library/simplicity/components/table/mat-table.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Table extends HTMLElement {

    materials(query, callback) {
        jsonClient.get("materials.json")
            .then((response) => {
                let filter;

                if (query.search) {
                    filter = response.filter(row => String(row[query.search.path]).startsWith(query.search.value));
                } else {
                    filter = response;
                }

                let result = filter.slice(query.index, query.index + query.limit);
                callback(result, response.length)
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
    name: "documentation-table",
    class: Table
})