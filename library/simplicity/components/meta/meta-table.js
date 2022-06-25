import {customComponents} from "../../simplicity.js";
import MatTable from "../table/mat-table.js";
import {loader} from "../../processors/loader-processor.js";
import MetaColumn from "./meta-column.js";
import {isEqual} from "../../services/tools.js";
import MatTableExtension from "../table/mat-table-extension.js";
import MatTableSearch from "../table/mat-table-search.js";
import MetaTableFilter from "./meta-table-filter.js";

class MetaTable extends HTMLElement {

    parent;

    schema = {
        rows : {
            items : {
                properties : {}
            }
        }
    };

    initialize() {
        let table = this.querySelector("table");
        this.addEventHandler("schema", this, () => {
            const tx = db.transaction("table", "readwrite");
            const store = tx.objectStore("table");
            let idbRequest = store.get(JSON.stringify(this.schema));
            idbRequest.onsuccess = (event) => {
                if (event.target.result) {
                    table.columns = JSON.parse(event.target.result.columns);
                    table.load();
                }
            }
        });
        table.addEventListener("load", () => {
            const tx = db.transaction("table", "readwrite");
            const store = tx.objectStore("table");
            store.put({
                id: JSON.stringify(this.schema),
                columns: JSON.stringify(table.columns)
            });
        })
    }

    search() {
        let table = this.querySelector("table");
        table.load();
    }

    items = (query, callback) => {
        this.parent(query, (rows, size, schema) => {
            if (! isEqual(schema, this.schema)) {
                this.schema = schema;
            }
            callback(rows, size)
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                this.parent = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name : "items",
                type : "input"
            }
        ]
    }

    static get components() {
        return [MatTable, MetaColumn, MatTableExtension, MatTableSearch, MetaTableFilter]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table.html")
    }

}

export default customComponents.define("meta-table", MetaTable)