import {customComponents} from "../../simplicity.js";
import MatTable from "../table/mat-table.js";
import {loader} from "../../processors/loader-processor.js";
import MetaColumn from "./meta-column.js";
import {idExtractor, uriTemplate} from "../../services/tools.js";
import MatTableExtension from "../table/mat-table-extension.js";
import MatTableSearch from "../table/mat-table-search.js";
import MetaTableFilter from "./meta-table-filter.js";

class MetaTable extends HTMLElement {

    model;

    search() {
        let table = this.querySelector("table");
        table.load();
    }

    onModel(event) {
        this.dispatchEvent(new CustomEvent("model", {detail: event.detail}))
    }

    initialize() {
        let table = this.querySelector("table");
        const tx = db.transaction("table", "readwrite");
        const store = tx.objectStore("table");
        let idbRequest = store.get(JSON.stringify(this.model));
        idbRequest.onsuccess = (event) => {
            if (event.target.result) {
                table.columns = JSON.parse(event.target.result.columns);
                table.load();
            }
        }
        table.addEventListener("load", () => {
            const tx = db.transaction("table", "readwrite");
            const store = tx.objectStore("table");
            store.put({
                id : JSON.stringify(this.model),
                columns : JSON.stringify(table.columns)
            });
        })
    }

    items = (query, callback) => {
        let link = this.model.$schema.links.list;

        let url = uriTemplate(link.url);

        url.append("index", query.index);
        url.append("limit", query.limit);

        if (query.sort) {
            url.append("sort", query.sort);
        }

        if (query.filter) {
            let filter = idExtractor(query.filter)
            Object.entries(filter)
                .forEach(([key, value]) => {
                    if (value instanceof Array) {
                        for (const item of value) {
                            url.append(key, item)
                        }
                    } else if (value instanceof Object) {
                        url.append(key, `from${value.from}to${value.to}`)
                    } else {
                        url.append(key, value);
                    }
                })
        }

        let result = url.build();

        fetch(result).then(response => response.json().then(result => {
            callback(result.rows, result.size)
        }))

    }

    onCreate() {
        let link = this.model.$schema.links.create;
        window.location.hash = `#/hive/navigator/navigator?link=${encodeURIComponent(link.url)}`
    }

    get create() {
        return this.model.$schema.links.create;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break;
            case "create" : {
                this.create = newValue === "true";
            }
                break;
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "input"
            }, {
                name: "create",
                type: "input"
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