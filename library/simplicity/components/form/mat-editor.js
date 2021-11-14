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

        }, {lifeCycle : true});

        if (this.name) {
            let domForm = this.queryUpwards((element) => {
                return element instanceof DomForm
            });
            if (domForm) {
                domForm.register(this);
            }
        }
    }

    fontNameClick(event) {
        document.execCommand("fontname", false, event.detail.select);
    }

    fontSizeClick(event) {
        document.execCommand("fontSize", false, event.detail.select);
    }

    formatBlockClick(event) {
        document.execCommand("formatBlock", false, event.detail.select)
    }


    boldClick() {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand('bold', false, null)
    }

    italicClick() {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("italic", false, null);
    }

    strikethroughClick() {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("strikethrough", false, null)
    }

    subscriptClick() {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("subscript", false, null)
    }

    superscriptClick() {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("superscript", false, null)
    }


    colorClick(event) {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("foreColor", false, event.detail.select)
    }

    backGroundColorClick(event) {
        document.execCommand("styleWithCSS", false, true);
        document.execCommand("backColor", false, event.detail.select);
    }


    justifyFullClick() {
        document.execCommand("justifyFull");
    }

    justifyLeftClick() {
        document.execCommand("justifyLeft")
    }

    justifyRightClick() {
        document.execCommand("justifyRight");
    }

    justifyCenterClick() {
        document.execCommand("justifyCenter");
    }

    indentClick() {
        document.execCommand("indent");
    }

    outdentClick() {
        document.execCommand("outdent");
    }

    floatLeftClick() {
        let selection = window.getSelection();
        let parentElement = selection.anchorNode;

        let computedStyle = window.getComputedStyle(parentElement);

        if (computedStyle.float === "left") {
            parentElement.style.float = "";
        } else {
            parentElement.style.float = "left";
        }
    }

    floatRightClick() {
        let selection = window.getSelection();
        let parentElement = selection.anchorNode;

        let computedStyle = window.getComputedStyle(parentElement);

        if (computedStyle.float === "right") {
            parentElement.style.float = "";
        } else {
            parentElement.style.float = "right";
        }
    }


    copyClick() {
        document.execCommand("copy")
    }

    cutClick() {
        document.execCommand("cut")
    }

    undoClick() {
        document.execCommand("undo")
    }

    deleteClick() {
        document.execCommand("delete")
    }

    selectAllClick() {
        document.execCommand("selectALl")
    }

    redoClick() {
        document.execCommand("redo")
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

    insertTableClick() {
        let dialog = EditorTableDialog();

        document.componentQuery("body")
            .appendChild(dialog);

        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);

        dialog.callback = function (columnsSize) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(rangeAt);

            let columns = [];
            let outerHTML = document.createElement("td").outerHTML;
            for (let i = 0; i < columnsSize; i++) {
                columns.push(outerHTML);
            }

            let table = `<table is="editor-table" style="border-collapse: separate;width: 100%; table-layout: fixed;">
                                        <tr>
                                            ${columns.join("")}
                                        </tr>
                                 </table>`

            document.execCommand("insertHTML", false, table)

            dialog.close();
        }
    }

    insertOrderedListClick() {
        document.execCommand("insertOrderedList")
    }

    insertUnorderedListClick() {
        document.execCommand("insertUnorderedList")
    }

    insertDivFlex() {

        let html = `<div is="editor-flexbox" style="display: flex">
                                <div style="flex: 1">Insert here...</div>
                            </div>`;

        document.execCommand("insertHTML", false, html)
    }

    insertParagraphClick() {
        document.execCommand("insertParagraph")
    }

    /*
        initialize() {
            let element = this.querySelector("div.content");
            element.innerHTML = this.model.html;
        }
    */

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "model" : {
                this.model = newValue;
                let element = this.querySelector("div.content");
                if (element.innerHTML !== newValue) {
                    element.innerHTML = newValue.html;
                }
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