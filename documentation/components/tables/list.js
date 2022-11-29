import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatList from "../../../library/simplicity/components/table/mat-list.js";

class List extends HTMLElement {

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
        return [MatList, DomCode]
    }

    static get template() {
        return loader("documentation/components/tables/list.html")
    }

}

export default customViews.define({
    name: "documentation-grid", class: List
})