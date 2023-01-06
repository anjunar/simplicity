import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../util/loader.js";
import {Input, mix} from "../../util/tools.js";
import DomForm from "../../directives/dom-form.js";

class MatLike extends mix(HTMLElement).with(Input) {

    index = 0;
    limit = 5

    window = [];
    size = 0;

    open = false;

    items;
    name;

    initialize() {
        this.model = false;

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        let listener = () => {
            if (this.open) {
                this.open = false;
            }
        };

        window.addEventListener("click", listener)

        MatLike.prototype.destroy = () => {
            window.removeEventListener("click", listener);
        }

    }

    overlayOpen(event) {
        event.stopPropagation();
        this.load();
        return false;
    }

    load() {
        this.items({index : this.index, limit : this.limit}, (rows, size) => {
            this.open = true;
            this.window = rows;
            this.size = size
        });
    }

    onClick() {
        this.model = ! this.model;
        this.dispatchEvent(new CustomEvent("like"));
    }

    up(event) {
        event.stopPropagation();
        this.index -= this.limit
        this.load();
        return false;
    }

    down(event) {
        event.stopPropagation();
        this.index += this.limit;
        this.load();
        return false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue
            }
                break
            case "name" : {
                this.name = newValue;
            }
                break;
            case "items" : {
                this.items = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name : "items",
                binding: "input"
            },
            {
                name: "model",
                binding: "two-way"
            },
            {
                name: "name",
                binding: "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-like.html")
    }
}

export default customComponents.define("mat-like", MatLike)