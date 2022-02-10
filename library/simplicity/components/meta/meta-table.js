import {customComponents} from "../../simplicity.js";
import MatTable from "../table/mat-table.js";
import {jsonClient} from "../../services/client.js";
import {loader} from "../../processors/loader-processor.js";
import MetaColumn from "./meta-column.js";

class MetaTable extends HTMLElement {

    model;

    properties() {
        let result = [];
        for (const property of Object.keys(this.model.$schema.properties.rows.items.properties)) {
            let value = {};
            Object.assign(value, this.model.$schema.properties.rows.items.properties[property])
            value.name = property;
            result.push(value)
        }
        return result;
    }

    renderCol(name) {
        return "{{data." + name + "}}"
    }

    renderModel(name) {
        return "data." + name;
    }

    onModel(event) {
        this.dispatchEvent(new CustomEvent("model", {detail : event.detail}))
    }

    items = (query, callback) => {
        let link = this.model.links.find((link) => link.rel === "list")

        jsonClient.action(link.method, `${link.url}`)
            .then((result) => {
                callback(result.rows, result.size)
            })
    }

    onCreate() {
        let link = this.model.links.find((link) => link.rel === "create");
        window.location.hash = `#/hive/navigator/navigator?link=${encodeURIComponent(link.url)}`
    }

    get create() {
        return this.model.links.find((link) => link.rel === "create");
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
                name : "create",
                type : "input"
            }
        ]
    }

    static get components() {
        return [MatTable, MetaColumn]
    }

    static get template() {
        return loader("library/simplicity/components/meta/meta-table.html")
    }

}

export default customComponents.define("meta-table", MetaTable)