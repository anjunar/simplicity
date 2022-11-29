import {customComponents} from "../../../simplicity/simplicity.js";
import {windowManager} from "../../manager/window-manager.js";
import DomForm from "../../../simplicity/directives/dom-form.js";
import {Input, mix} from "../../../simplicity/util/tools.js";
import {Membrane} from "../../service/membrane.js";
import {libraryLoader} from "../../util/loader.js";
import {contentChildren} from "../../interpreters/json-interpreter.js";

class MatTable extends mix(HTMLElement).with(Input) {

    index = 0;
    limit = 5;
    size = 0;

    items = () => {};
    window = [];
    columns = [];
    extension;

    name;
    create = false;
    contentTemplate;
    header = []
    body = []

    preInitialize() {
        this.contentTemplate = contentChildren(this);

        let callback = () => {
            this.header = Array.from(this.contentTemplate.querySelectorAll("thead tr td"))
            this.body = Array.from(this.contentTemplate.querySelectorAll("tbody tr td"))
            this.extension = this.contentTemplate.querySelector("search")
            let length = this.body.length;

            if (this.extension) {
                let tableSearches = this.extension.querySelectorAll("mat-table-search")
                let columns = [];
                for (let i = 0; i < length; i++) {
                    let tableSearch = tableSearches[i];
                    let colAttribute = tableSearch.path;
                    let sortable = tableSearch.sortable;
                    let visible = tableSearch.visible;
                    if (visible === undefined || visible === null) {
                        visible = true
                    }
                    let column = {
                        index: i,
                        visible: visible ,
                        sort: sortable ? "none" : null,
                        path: colAttribute,
                        search : ""
                    };
                    columns.push(column);

                    switch (tableSearch.schema.widget) {
                        case "lazy-select" : {
                            column.search = column.search || undefined
                        } break;
                        case "lazy-multi-select" : {
                            column.search = column.search || []
                        } break;
                        case "datetime-local" : {
                            column.search = column.search || {from : "", to : ""}
                        } break;
                        case "date" : {
                            column.search = column.search || {from : "", to : ""}
                        } break;
                        case "number" : {
                            column.search = column.search || {from : "", to : ""}
                        } break;
                        default : {
                            column.search = column.search || "";
                        }
                    }

                }
                this.columns = columns;
            } else {
                let columns = [];
                for (let i = 0; i < length; i++) {
                    columns.push({
                        index: i,
                        visible: true,
                        sort: null,
                        path: null,
                        search : ""
                    });
                }
                this.columns = columns;
            }

            this.dispatchEvent(new CustomEvent("columns"))
        };

        let mutationObserver = new MutationObserver(callback)

        mutationObserver.observe(this.contentTemplate, {childList : true, subtree : true})

        callback()
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
        this.load();
    }

    row(row, index, length) {
        row.resolve.rowIndex = index;
        row.resolve.rowLength = length;
        return row;
    }

    onRowClick(event, row) {
        this.model = row;
        this.dispatchEvent(new CustomEvent("model", {detail : row}))
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
        column.sort = "none";
        td.sort = "none";
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
                    return (search.from && search.to) || search.id
                }
                return column.search && (column.search.length > 0 || Number.isInteger(column.search))
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
        windowManager.openWindow("library/simplicity/components/table/mat-table-configuration.js", {
            data: {
                table: this
            }
        })
    }

    configuration(array, all) {
        let method = () => {
            if (all) {
                return array;
            }
            return array.filter((td) => td.visible);
        }

        let resonator = (callback, element) => {
            let handlers = [];
            for (const item of array) {
                handlers.push(Membrane.track(item, {
                    property : "visible",
                    element : element,
                    handler : callback,
                    scoped : true
                }))
            }
            handlers.push(Membrane.track(this, {
                property: "columns",
                element: element,
                handler: callback
            }))

            return handlers;
        }

        let activator = (callback, element) => {
            this.addEventListener("columns", callback)
            element.addEventListener("removed", () => {
                this.removeEventListener("columns", callback)
            })
        }

        return {method, resonator, activator}
    }

    left(index) {
        let element = this.columns[index];
        let other = this.columns[index - 1];

        let newColumns = Array.from(this.columns);
        newColumns[index] = other;
        newColumns[index - 1] = element;

        this.columns = newColumns;
        this.dispatchEvent(new CustomEvent("load"));
    }

    right(index) {
        let element = this.columns[index];
        let other = this.columns[index + 1];

        let newColumns = Array.from(this.columns);

        newColumns[index] = other;
        newColumns[index + 1] = element;

        this.columns = newColumns;
        this.dispatchEvent(new CustomEvent("load"));
    }

    skipPrevious() {
        this.index = 0;
        this.load();
    }

    arrowLeft() {
        this.index -= this.limit;
        this.load();
    }

    arrowRight() {
        this.index += this.limit;
        this.load();
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
                binding: "input"
            }, {
                name : "name",
                binding : "input"
            }, {
                name : "create",
                binding : "input"
            }, {
                name : "hoover",
                binding : "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity/components/table/mat-table.html")
    }


}

export default customComponents.define("mat-table", MatTable)