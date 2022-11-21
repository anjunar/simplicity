import {customComponents} from "../../../simplicity/simplicity.js";
import EditorToolbar from "./mat-editor/editor-toolbar.js";
import DomForm from "../../../simplicity/directives/dom-form.js";
// import {contextManager} from "../../manager/context-manager.js";
import MatTabs from "../navigation/mat-tabs.js";
import MatTab from "../navigation/mat-tab.js";
import MatPages from "../navigation/mat-pages.js";
import MatPage from "../navigation/mat-page.js";
import {mix, Input} from "../../util/tools.js";
import {libraryLoader} from "../../util/loader.js";

class MatEditor extends mix(HTMLElement).with(Input) {

    name;

    model = {
        html: "",
        text: ""
    };

    contents;
    placeholder;

    page = 0;

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

    onInput(event) {
        this.model.html = event.target.innerHTML;
        this.model.text = event.target.innerText
        this.dispatchEvent(new Event("model"));
    }

    contextmenuClick(event) {
        event.stopPropagation();
        event.preventDefault();

        let content = this.querySelector("div.content");
        let newPath = [];
        for (const segment of event.path) {
            if (segment === content) {
                break
            }
            newPath.push(segment);
        }

        contextManager.openContext("library/simplicity/components/form/mat-editor/context-menu.js", {
            pageX : event.pageX,
            pageY : event.pageY,
            data: {
                path: newPath
            }
        })
        return false;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
            }
                break
            case "placeholder" : {
                this.placeholder = newValue;
            }
                break
            case "name" : {
                this.name = newValue;
            }
        }
    }

    static get components() {
        return [EditorToolbar, MatTabs, MatTab, MatPages, MatPage]
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                binding: "two-way"
            },
            {
                name: "placeholder",
                binding: "input"
            },
            {
                name : "name",
                binding : "input"
            }
        ]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor.html")
    }
}

export default customComponents.define("mat-editor", MatEditor)