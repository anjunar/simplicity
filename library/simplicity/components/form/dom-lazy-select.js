import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomRepeat from "../../directives/dom-repeat.js";
import DomSlot from "../../directives/dom-slot.js";
import DomIf from "../../directives/dom-if.js";
import DomInput from "../../directives/dom-input.js";
import DomForm from "../../directives/dom-form.js";

class DomLazySelect extends HTMLElement {

    index = 0;
    limit = 5;
    size;

    model;
    window = [];
    items = () => {}
    open = false;
    label = "name";

    get isInput() {
        return true;
    }

    initialize() {
        window.addEventListener("click", () => {
            this.open = false;
        })

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    get placeholder() {
        return this.querySelector("input").placeholder
    }

    set placeholder(value) {
        this.querySelector("input").placeholder = value;
    }

    inputWidth() {
        return this.querySelector("input").offsetWidth;
    }

    onItemClicked(event, item) {
        event.stopPropagation();
        this.model = item;
        let value = item[this.label];
        let input = this.querySelector("input");
        input.value = value;
        this.open = false;
        this.dispatchEvent(new CustomEvent("model"))
        return false;
    }

    openOverlay(event) {
        event.stopPropagation();
        this.load();
        return false;
    }

    up() {
        this.index -= this.limit
        this.load();
    }

    down() {
        this.index += this.limit;
        this.load();
    }

    load() {
        let input = this.querySelector("input");
        this.items({index : this.index, limit : this.limit, value : input.value}, (data, size) => {
            this.window = data;
            this.size = size;
            this.open = true;
            document.dispatchEvent(new CustomEvent("lifecycle"));
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            } break;
            case "placeholder" : {
                let input = this.querySelector("input");
                input.placeholder = newValue;
            } break;
            case "items" : {
                this.items = newValue;
            } break;
            case "label" : {
                this.label = newValue;
            }
        }
    }

    static get components() {
        return [DomRepeat, DomSlot, DomIf, DomInput]
    }

    static get observedAttributes() {
        return [
            {
                name: "value",
                type: "two-way"
            }, {
                name : "placeholder",
                type : "input"
            }, {
                name : "items",
                type : "input"
            }
        ]
    }

    static get template() {
        return loader("library/simplicity/components/form/dom-lazy-select.html")
    }

}

export default customComponents.define("dom-lazy-select", DomLazySelect)