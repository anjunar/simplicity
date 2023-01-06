import {customComponents} from "../../simplicity.js";
import DomInput from "../../directives/dom-input.js";
import DomForm from "../../directives/dom-form.js";
import {debounce, Input, isEqual, mix} from "../../util/tools.js";
import {libraryLoader} from "../../util/loader.js";
import {Membrane} from "../../service/membrane.js";

class DomLazySelect extends mix(HTMLElement).with(Input) {

    index = 0;
    limit = 5;
    size;

    window = [];
    items = () => {}
    open = false;
    label = "name";

    placeholder = "";
    defaultValue = "";
    name;
    disabled = "false";
    multiSelect = false;
    showSelected = false;
    search = "";
    id = "id";

    initialize() {
        if (this.multiSelect) {
            this.model = this.model || [];
        } else {
            this.model = this.model || null;
        }

        Membrane.track(this, {
            property : "model",
            element : this,
            handler : () => {
                this.doRender();
            }
        });

        let listener = () => {
            if (this.open) {
                this.open = false;
            }
        };

        window.addEventListener("click", listener)

        DomLazySelect.prototype.destroy = () => {
            window.removeEventListener("click", listener);
        }

        Membrane.track(this, {
            property : "search",
            element : this,
            handler : debounce(() => {
                this.load();
            }, 300)
        })

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        let input = this.querySelector("input");
        input.placeholder = this.placeholder;

        input.addEventListener("keydown", (event) => {
            if(event.key === 'Enter') {
                this.dispatchEvent(new CustomEvent("enter", {detail : event.target.value}));
            }
        })

        this.doRender();
    }

    doRender() {
        let input = this.querySelector("input");

        if (this.model) {
            if (! this.getAttribute("read:onenter")) {
                // input.disabled = true;
            }
            if (this.multiSelect) {
                if (this.label instanceof Array) {
                    input.value = this.model.map(model => this.label.map(label => model[label]).join(" ")).join(", ")
                } else {
                    input.value = this.model.map(model => model[this.label]).join(", ")
                }
            } else {
                if (this.label instanceof Array) {
                    input.value = this.label.map((label) => this.model[label]).join(" ")
                } else {
                    if (typeof this.model === "string") {
                        input.value = this.model;
                    } else {
                        input.value = this.model[this.label]
                    }

                }
            }
        } else {
            if (input) {
                input.value = ""
            }
        }

        if (input) {
            input.dispatchEvent(new Event("input"));
        }
    }

    inputWidth() {
        let method = () => {
            let input = this.querySelector("input");
            if (input) {
                return input.offsetWidth;
            }
            return 0;
        }
        let resonator = (callback, element) => {
            let listener = () => {
                callback();
            };

            window.addEventListener("resize", listener)
            element.addEventListener("removed", () => {
                window.removeEventListener("resize", listener)
            })
        }
        return {method, resonator}
    }

    onItemClicked(event, item) {
        event.stopPropagation();
        if (this.multiSelect) {
            let find = this.model.find(model => isEqual(model[this.id], item[this.id]));
            if (! find) {
                this.model.push(item);
            } else {
                let indexOf = this.model.indexOf(item);
                this.model.splice(indexOf, 1);
            }
        } else {
            if (this.model) {
                if (isEqual(this.model, item)) {
                    this.model = null;
                } else {
                    this.model = item;
                }
            } else {
                this.model = item;
            }

        }

        this.doRender();

        this.open = false;
        this.dispatchEvent(new CustomEvent("model"))
        this.dispatchEvent(new CustomEvent("input"));
        return false;
    }

    openOverlay(event) {
        event.stopPropagation();
        if (this.disabled === undefined || this.disabled === null || this.disabled === "false") {
            this.load();
        }
        return false;
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

    checkbox(event, item) {
        event.stopPropagation();

        this.onItemClicked(event, item);

        return false;
    }

    showSelectedClick(event) {
        event.stopPropagation();

        this.showSelected = ! this.showSelected;

        if (this.showSelected) {
            this.index = 0;
            this.size = this.model.length;
            if (this.multiSelect) {
                this.window = this.model.slice(this.index, this.index + this.limit);
            } else {
                this.window = [this.model];
            }
        } else {
            this.load();
        }

        return false;
    }

    searchBox(event) {
        event.stopPropagation();
        return false;
    }

    onWheel(event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.deltaY > 0) {
            if (this.index + this.limit < this.size) {
                this.index += this.limit
                this.load();
            }
        } else {
            if (this.index > 0) {
                this.index -= this.limit
                this.load();
            }
        }

        return false;
    }

    selected(item) {
        if (this.multiSelect) {
            return this.model.some((model) => isEqual(model[this.id], item[this.id]))
        } else {
            if (this.model) {
                return isEqual(this.model[this.id],item[this.id]);
            }
            return false;
        }
    }

    load() {
        if (this.showSelected) {
            this.open = true;
            if (this.multiSelect) {
                this.window = this.model.slice(this.index, this.index + this.limit);
            } else {
                this.window = [this.model];
            }
        } else {
            this.items({index : this.index, limit : this.limit, value : this.search}, (data, size) => {
                this.size = size;
                this.open = true;
                this.showSelected = false;
                this.window = data;
                let viewport = this.queryUpwards((element) => element.localName === "viewport");

                let height = 14 + 39 + data.length * 42;
                let selectBoundingClientRect = this.getBoundingClientRect();
                let viewPortBoundingClientRect = viewport.getBoundingClientRect();
                let overlay = this.querySelector("div.overlay");
                if (selectBoundingClientRect.top + height > viewPortBoundingClientRect.top + viewPortBoundingClientRect.height) {
                    overlay.style.top = "initial"
                    overlay.style.bottom = "24px"
                } else {
                    overlay.style.top = "14px";
                    overlay.style.bottom = "initial";
                }
            })
        }
    }


    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            } break;
            case "placeholder" : {
                this.placeholder = newValue;
            } break;
            case "items" : {
                this.items = newValue;
            } break;
            case "label" : {
                this.label = newValue;
            } break;
            case "name" : {
                this.name = newValue
            } break;
            case "disabled" : {
                this.disabled = newValue;
            } break
            case "multiselect" : {
                this.multiSelect = newValue === "true"
            } break;
            case "id" : {
                this.id = newValue;
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
                binding: "two-way"
            }, {
                name : "placeholder",
                binding : "input"
            }, {
                name : "items",
                binding : "input"
            }, {
                name : "label",
                binding : "input"
            }, {
                name : "name",
                binding : "input"
            }, {
                name : "disabled",
                binding: "input"
            }, {
                name : "multiselect",
                binding: "input"
            }, {
                name : "id",
                binding: "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/dom-lazy-select.html")
    }

}

export default customComponents.define("dom-lazy-select", DomLazySelect)