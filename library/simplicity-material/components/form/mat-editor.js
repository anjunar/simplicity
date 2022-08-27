import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import EditorToolbar from "./mat-editor/editor-toolbar.js";
import DomForm from "../../../simplicity-core/directives/dom-form.js";
import {contextManager} from "../../manager/context-manager.js";
import {Input, mix} from "../../../simplicity-core/services/tools.js";

class MatEditor extends mix(HTMLElement).with(Input) {

    name;

    model = {
        html: "",
        text: ""
    };

    contents;
    placeholder;

    initialize() {
        this.contents.addEventListener("input", () => {
            this.model.html = this.contents.innerHTML;
            this.model.text = this.contents.innerText
            this.dispatchEvent(new Event("model"));
        });

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }

        let element = this.querySelector("div.content");
        if (this.model.html === undefined || this.model.html === null) {
            // No Op
        } else {
            if (element.innerHTML !== this.model.html) {
                element.innerHTML = this.model.html;
            }
        }
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

        contextManager.openContext("library/simplicity-material/components/form/mat-editor/context-menu.js", {
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
        return [EditorToolbar]
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
        return libraryLoader("simplicity-material/components/form/mat-editor.html")
    }
}

export default customComponents.define("mat-editor", MatEditor)