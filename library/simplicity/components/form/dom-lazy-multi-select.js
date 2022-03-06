import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomLazySelect from "./dom-lazy-select.js";
import DomForm from "../../directives/dom-form.js";
import {Input, isEqual, mix} from "../../services/tools.js";

class DomLazyMultiSelect extends mix(HTMLElement).with(Input) {

    open = false
    items;
    label = "name";
    placeholder;
    model = [];
    name;

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

    onItemClicked(event) {
        let item = event.target.model;
        let find = this.model.find((source) => isEqual(source, item))
        if (! find) {
            this.model.push(item)
        }
        this.dispatchEvent(new CustomEvent("model"))
    }

    onDeleteItem(item) {
        let indexOf = this.model.indexOf(item);
        this.model.splice(indexOf, 1);
        if (this.model.length === 0) {
            this.open = false;
        }
        this.dispatchEvent(new CustomEvent("model"))
    }

    onToggle() {
        if (this.model.length > 0) {
            return this.open = ! this.open;
        }
        return this.open = false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue || [];
            }
                break
            case "placeholder" : {
                this.placeholder = newValue;
            }
                break
            case "items" : {
                this.items = newValue;
            }
                break;
            case "label" : {
                this.label = newValue;
            }
                break;
            case "name" : {
                this.name = newValue
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "two-way"
            }, {
                name: "placeholder",
                type: "input"
            }, {
                name: "items",
                type: "input"
            }, {
                name: "label",
                type: "input"
            }, {
                name : "name",
                type : "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect]
    }

    static get template() {
        return loader("library/simplicity/components/form/dom-lazy-multi-select.html")
    }
}

export default customComponents.define("dom-lazy-multi-select", DomLazyMultiSelect)