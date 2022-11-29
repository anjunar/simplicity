import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatList extends HTMLElement {

    index = 0;
    limit = 5;
    size = 0;

    items;
    window = [];

    initialize() {
        this.load();
    }

    load() {
        this.items({index : this.index, limit : this.limit}, (rows, size) => {
            this.window = rows;
            this.size = size;
        })
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

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "items" : {
                this.items = newValue;
            } break;
        }
    }

    static get observedAttributes() {
        return [{
            name: "items",
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity/components/table/mat-list.html")
    }

}

export default customComponents.define("mat-list", MatList)