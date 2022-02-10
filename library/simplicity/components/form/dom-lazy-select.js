import {customComponents, mix, Input} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomInput from "../../directives/dom-input.js";
import DomForm from "../../directives/dom-form.js";
import {lifeCycle} from "../../processors/life-cycle-processor.js";

class DomLazySelect extends mix(HTMLElement).with(Input) {

    index = 0;
    limit = 5;
    size;

    window = [];
    items = () => {}
    open = false;
    label = "name";

    defaultValue = "";

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

    render() {
        if (this.model) {
            let input = this.querySelector("input");
            if (this.label instanceof Array) {
                input.value = this.label.map((label) => this.model[label]).join(" ")
            } else {
                input.value = this.model[this.label]
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
        let inputElement = this.querySelector("input");
        if (inputElement) {
            return inputElement.offsetWidth;
        }
        return 0;
    }

    onItemClicked(event, item) {
        event.stopPropagation();
        this.model = item;

        let value;
        if (this.label instanceof Array) {
            value = this.label.map((label) => item[label]).join(" ")
        } else {
            value = item[this.label];
        }
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
            lifeCycle();
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
        return [DomInput]
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "two-way"
            }, {
                name : "placeholder",
                type : "input"
            }, {
                name : "items",
                type : "input"
            }, {
                name : "label",
                type : "input"
            }
        ]
    }

    static get template() {
        return loader("library/simplicity/components/form/dom-lazy-select.html")
    }

}

export default customComponents.define("dom-lazy-select", DomLazySelect)