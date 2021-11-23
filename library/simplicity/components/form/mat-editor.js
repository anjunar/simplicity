import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import EditorToolbar from "./mat-editor/editor-toolbar.js";
import {windowManager} from "../../services/window-manager.js";
import DomForm from "../../directives/dom-form.js";

class MatEditor extends HTMLElement {

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

        let element = this.querySelector("div.content");
        if (element.innerHTML !== this.model.html) {
            element.innerHTML = this.model.html;
        }

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    insertLinkClick() {
        let dialog = linkDialog();

        document.componentQuery("body")
            .appendChild(dialog);

        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);

        dialog.callback = function (value) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(rangeAt);
            document.execCommand("createLink", false, `#/anjunar/pages/page.js?id=${value.id}`);
            dialog.close();
        }
    }

    insertUnLinkClick() {
        document.execCommand("unlink")
    }

    insertImageClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);

        let options = {
            width: "640px",
            height: "480px",
            header: "Image Upload"
        };

        windowManager.openWindow("/library/simplicity/components/form/mat-editor/dialog/image-upload-dialog", options).then((matWindow) => {
            matWindow.addEventListener("ok", (event) => {
                let value = event.target.contents.value;
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(rangeAt);
                document.execCommand("insertImage", false, value.data);
                matWindow.close();
            })
        })
    }

    insertHorizontalRuleClick() {
        document.execCommand("insertHorizontalRule")
    }

    insertTextClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);

        let options = {
            width: "640px",
            height: "480px",
            header: "Text import"
        };

        windowManager.openWindow("/library/simplicity/components/form/mat-editor/dialog/text-dialog", options).then((matWindow) => {
            matWindow.addEventListener("ok", (event) => {
                let value = event.target.contents.value;
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(rangeAt);
                document.execCommand("insertText", false, value);
                matWindow.close();
            })
        });

    }

    insertOrderedListClick() {
        document.execCommand("insertOrderedList")
    }

    insertUnorderedListClick() {
        document.execCommand("insertUnorderedList")
    }

    insertParagraphClick() {
        document.execCommand("insertParagraph")
    }


    contextmenuClick(event) {
        event.stopPropagation();

        let content = this.querySelector("div.content");
        let newPath = [];
        for (const segment of event.path) {
            if (segment === content) {
                break
            }
            newPath.push(segment);
        }

        windowManager.openWindow("/library/simplicity/components/form/mat-editor/dialog/context-dialog", {
            data: {
                path: newPath
            }
        })
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
        }
    }

    static get components() {
        return [EditorToolbar]
    }

    static get observedAttributes() {
        return [
            {
                name: "model",
                type: "two-way"
            },
            {
                name: "placeholder",
                type: "input"
            }
        ]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor.html")
    }
}

export default customComponents.define("mat-editor", MatEditor)