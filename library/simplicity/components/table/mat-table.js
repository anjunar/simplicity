import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import {windowManager} from "../../manager/window-manager.js";
import {contentManager} from "../../manager/content-manager.js";
import DomForm from "../../directives/dom-form.js";
import {Input, mix} from "../../services/tools.js";

class MatTable extends mix(HTMLTableElement).with(Input) {

    index = 0;
    limit = 5;
    size = 0;

    items = () => {};
    window = [];
    columns = [];
    extension;

    name;
    create = false;

    preInitialize() {
        this.extension = this.queryUpwards((element) => element.localName === "mat-table-extension")
        this.columns = [];
        let length = this.body.length;

        if (this.extension) {
            let content = contentManager.instance(this.extension);
            let tableSearches = content.querySelectorAll("tsearch mat-table-search")
            for (let i = 0; i < length; i++) {
                let tableSearch = tableSearches[i];
                let colAttribute = tableSearch.path;
                let sortable = tableSearch.sortable;

                this.columns.push({
                    index: i,
                    visible: true,
                    sort: sortable ? undefined : null,
                    path: colAttribute,
                    search : ""
                });
            }
        } else {
            for (let i = 0; i < length; i++) {
                this.columns.push({
                    index: i,
                    visible: true,
                    sort: null,
                    path: null,
                    search : ""
                });
            }
        }

        if (length > 0) {
            this.load();
        }
    }

    initialize() {
        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    onRowClick(event, row) {
        this.model = row;
        this.dispatchEvent(new CustomEvent("model", {detail : row}))
    }

    get header() {
        let template = contentManager.instance(this);
        return Array.from(template.querySelectorAll("thead tr td"))
    }

    get body() {
        let template = contentManager.instance(this);
        return Array.from(template.querySelectorAll("tbody tr td"))
    }

    desc(td) {
        let column = this.columns[td.index];
        column.sort = "desc";
        td.sort = "desc";
        this.load();
    }

    asc(td) {
        let column = this.columns[td.index];
        column.sort = "asc";
        td.sort = "asc"
        this.load();
    }

    none(td) {
        let column = this.columns[td.index];
        column.sort = undefined;
        td.sort = undefined;
        this.load();
    }

    load(path, event) {
        this.dispatchEvent(new CustomEvent("load"));

        let query = {
            index: this.index,
            limit: this.limit
        };

        if (path && event) {
            query.search = {
                path: path,
                value: event.target.value
            }
        }

        let filter = this.columns
            .filter((column) => {
                let search = column.search;
                if (search instanceof Array) {
                    return search.length > 0;
                }
                if (search instanceof Object) {
                    return search.from && search.to
                }
                return column.search.length > 0
            })
            .reduce((previous, current) => {
                let path = current.path;
                let search = current.search;
                previous[path] = search;
                return previous;
            }, {})

        let sorting = this.columns
            .filter((column) => column.sort)
            .map((column) => column.path + ":" + column.sort)

        query.filter = filter;

        if (sorting.length > 0) {
            query.sort = sorting
        }

        this.items(query, (data, size) => {
            this.window = data;
            this.size = size;
            this.open = true;
        })
    }

    showConfiguration() {
        windowManager.openWindow("/library/simplicity/components/table/mat-table-configuration", {
            data: {
                table: this
            }
        })
    }

    configuration(array, all) {
        if (all) {
            return array;
        }
        return array.filter((td) => td.visible);
    }

    configurationHandler(array, all, context) {
        for (const element of array) {
            element.addEventHandler("visible", context.element, () => {
                if (! all) {
                    context.callback(array.filter((td) => td.visible));
                }
            })
        }
        this.addEventHandler("columns", context.element, () => {
            context.callback(array.filter((td) => td.visible));
        })
    }

    left(index) {
        let element = this.columns[index];
        let other = this.columns[index - 1];

        this.columns[index] = other;
        this.columns[index - 1] = element;
    }

    right(index) {
        let element = this.columns[index];
        let other = this.columns[index + 1];

        this.columns[index] = other;
        this.columns[index + 1] = element;
    }

    skipPrevious() {
        this.index = 0;
        this.load();
    }

    arrowLeft() {
        this.index -= this.limit;
        this.load();
    }

    canArrowLeft() {
        return this.index > 0;
    }

    arrowRight() {
        this.index += this.limit;
        this.load();
    }

    canArrowRight() {
        return this.index + this.limit < this.size;
    }

    skipNext() {
        let number = Math.round(this.size / this.limit);
        this.index = (number - 1) * this.limit;
        this.load();
    }

    createClick() {
        this.dispatchEvent(new CustomEvent("create"));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                this.items = newValue;
            }
                break;
            case "name" : {
                this.name = newValue;
            }
                break;
            case "create" : {
                this.create = newValue || newValue === "true";
            }
                break;
            default : {}
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "items",
                type: "input"
            }, {
                name : "name",
                type : "input"
            }, {
                name : "create",
                type : "input"
            }, {
                name : "hoover",
                type : "input"
            }
        ]
    }

    static get template() {
        return loader("library/simplicity/components/table/mat-table.html")
    }


}

export default customComponents.define("mat-table", MatTable, {extends: "table"})