import {customComponents} from "../../simplicity.js";
import MatTable from "../table/mat-table.js";
import {jsonClient} from "../../services/client.js";
import {loader} from "../../processors/loader-processor.js";
import DomRepeat from "../../directives/dom-repeat.js";
import MetaColumn from "./meta-column.js";

class MetaTable extends HTMLElement {

    model;

    renderCol(name) {
        return "{{data." + name + "}}"
    }

    renderModel(name) {
        return "data." + name;
    }

    onRowClick(event) {
        let row = event.detail;
        let link = row.actions.find((link) => link.rel === "read");
        window.location.hash = `#/hive/navigator/navigator?link=${btoa(link.url)}`
    }

    items = (query, callback) => {
        let link = this.model.sources.find((link) => link.rel === "list")

        jsonClient.action(link.method, `${link.url}`)
            .then((result) => {
                callback(result.rows, result.size)
            })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "input"
            }
        ]
    }

    static get components() {
        return [MatTable, MetaColumn, DomRepeat]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table.html")
    }

}

export default customComponents.define("meta-table", MetaTable)