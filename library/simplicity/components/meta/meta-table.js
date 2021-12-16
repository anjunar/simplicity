import {customComponents} from "../../simplicity.js";
import MatTable from "../table/mat-table.js";
import {jsonClient} from "../../services/client.js";
import MetaInput from "./meta-input.js";

class MetaTable extends HTMLElement {

    model;

    renderCol(name) {
        return "${data." + name + "}"
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
        return [MatTable, MetaInput]
    }

    get dynamicTemplate() {
        return `<table is="mat-table" bind:items="items" bind:onRow="onRowClick($event)">
          <colgroup>
              <template is="dom-repeat" bind:items="model.columns" item="column" immediate="true">
                  <col bind:path="column.name">
              </template>
          </colgroup>
          <thead>
            <tr>
                <template is="dom-repeat" bind:items="model.columns" item="column" immediate="true">
                    <td>
                        <div>${column.name}</div>
                    </td>
                </template>
            </tr>
          </thead>
          <tbody>
            <tr>
                <template is="dom-repeat" bind:items="model.columns" item="column" immediate="true">
                    <td>
                        <div let="data">${renderCol(column.name)}</div>
                    </td>
                </template>
            </tr>
          </tbody>
      </table>`
    }

}

export default customComponents.define("meta-table", MetaTable)