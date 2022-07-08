import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../processors/loader-processor.js";
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
    disabled = "false";

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
        let find = this.model.find((source) => isEqual(source, item));
        if (! find) {
            this.model.push(item)
        }
        this.dispatchEvent(new CustomEvent("model"));
    }

    onDeleteItem(item) {
        let indexOf = this.model.indexOf(item);
        this.model.splice(indexOf, 1);
        if (this.model.length === 0) {
            this.open = false;
        }
        this.dispatchEvent(new CustomEvent("model"));
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
                break
            case "disabled" : {
                this.disabled = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                binding: "two-way"
            }, {
                name: "placeholder",
                binding: "input"
            }, {
                name: "items",
                binding: "input"
            }, {
                name: "label",
                binding: "input"
            }, {
                name : "name",
                binding : "input"
            }, {
                name : "disabled",
                binding : "input"
            }
        ]
    }

    static get components() {
        return [DomLazySelect]
    }

    static get template() {
        return libraryLoader("simplicity-core/components/form/dom-lazy-multi-select.html")
    }
}

export default customComponents.define("dom-lazy-multi-select", DomLazyMultiSelect)