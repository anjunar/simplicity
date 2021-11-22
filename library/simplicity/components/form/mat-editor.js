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

    insertTableClick(event) {
        let columns = event.detail.columns;
        let rows = event.detail.rows;

        let columnsHTML = "";
        for (let i = 0; i < columns; i++) {
            columnsHTML += "<td></td>"
        }

        let rowsHTML = "";
        for (let i = 0; i < rows; i++) {
            rowsHTML += "<tr>" + columnsHTML + "</tr>"
        }

        let table = "<table><tbody>" + rowsHTML + "</tbody></table>";

        document.execCommand("insertHTML", false, table)
    }

    addColumnClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);

        let node = rangeAt.commonAncestorContainer;
        let table = node.queryUpwards((node) => node.localName === "table")
        let rows = table.querySelectorAll("tr");
        for (const row of rows) {
            row.appendChild(document.createElement("td"))
        }
    }

    addRowClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);
        let node = rangeAt.commonAncestorContainer;
        let table = node.queryUpwards((node) => node.localName === "table")
        let tbody = table.querySelector("tbody");
        let trBody = tbody.querySelector("tr")
        let columns = trBody.querySelectorAll("td");

        let tr = document.createElement("tr");
        for (let i = 0; i < columns.length; i++) {
            tr.appendChild(document.createElement("td"))
        }
        tbody.appendChild(tr)
    }

    removeColumnClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);
        let node = rangeAt.commonAncestorContainer;
        let table = node.queryUpwards((node) => node.localName === "table")
        let rows = table.querySelectorAll("tr");
        for (const row of rows) {
            let tds = row.querySelectorAll("td");
            tds.item(tds.length - 1).remove();
        }
    }

    removeRowClick() {
        let selection = document.getSelection();
        let rangeAt = selection.getRangeAt(0);
        let node = rangeAt.commonAncestorContainer;
        let table = node.queryUpwards((node) => node.localName === "table")
        let trs = table.querySelectorAll("tr");
        trs.item(trs.length - 1).remove();
    }

    insertOrderedListClick() {
        document.execCommand("insertOrderedList")
    }

    insertUnorderedListClick() {
        document.execCommand("insertUnorderedList")
    }

    insertDivFlexClick(event) {
        let columns = event.detail.columns;

        let columnsHTML = ""
        for (let i = 0; i < columns; i++) {
            columnsHTML += "<div></div>"
        }

        let html = "<div class='flex'>" + columnsHTML + "</div>"

        document.execCommand("insertHTML", false, html)
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