import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
import {windowManager} from "../../../../manager/window-manager.js";

class ToolbarInserts extends HTMLElement {

    contents;

    link = {
        value: "",
        active: false,
        click(link) {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);

            let options = {
                header: "Link Dialog"
            };

            windowManager.openWindow("library/simplicity-material/components/form/mat-editor/dialog/link-dialog.js", options).then((matWindow) => {
                matWindow.addEventListener("ok", (event) => {
                    let value = event.target.contents.value;
                    document.getSelection().removeAllRanges();
                    document.getSelection().addRange(rangeAt);
                    document.execCommand("createLink", false, value);
                })
            });
        },
        handler(event) {

        }
    }
    unLink = {
        active: false,
        click(event) {
            document.execCommand("unlink")
        },
        handler(event) {

        }
    }
    insertDivFlex = {
        disabled: false,
        click(columns = 2) {
            let columnsHTML = ""
            for (let i = 0; i < columns; i++) {
                columnsHTML += "<div></div>"
            }

            let html = "<div class='flex' style='width: 100%'>" + columnsHTML + "</div>"

            document.execCommand("insertHTML", false, html)
        }
    }
    insertTable = {
        click(columns = 2, rows = 2) {
            let columnsHTML = "";
            for (let i = 0; i < columns; i++) {
                columnsHTML += "<td></td>"
            }

            let rowsHTML = "";
            for (let i = 0; i < rows; i++) {
                rowsHTML += "<tr>" + columnsHTML + "</tr>"
            }

            let table = "<table style='width: 100%'><tbody>" + rowsHTML + "</tbody></table>";

            document.execCommand("insertHTML", false, table)
        }
    }
    image = {
        active: false,
        click(event) {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);

            let options = {
                width: "640px",
                height: "480px",
                header: "Image Upload"
            };

            windowManager.openWindow("library/simplicity-material/components/form/mat-editor/dialog/image-upload-dialog.js", options).then((matWindow) => {
                matWindow.addEventListener("ok", (event) => {
                    let value = event.target.contents.value;
                    document.getSelection().removeAllRanges();
                    document.getSelection().addRange(rangeAt);
                    document.execCommand("insertImage", false, value.data);
                })
            })
        },
        handler: (event) => {

        }
    }
    horizontalRule = {
        active: false,
        click(event) {
            document.execCommand("insertHorizontalRule")
        },
        handler(event) {

        }
    }
    text = {
        active: false,
        click(event) {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);

            let options = {
                width: "640px",
                height: "480px",
                header: "Text import"
            };

            windowManager.openWindow("library/simplicity-material/components/form/mat-editor/dialog/text-dialog.js", options).then((matWindow) => {
                matWindow.addEventListener("ok", (event) => {
                    let value = event.target.contents.value;
                    document.getSelection().removeAllRanges();
                    document.getSelection().addRange(rangeAt);
                    document.execCommand("insertText", false, value);
                })
            });
        },
        handler(event) {

        }
    }
    orderedList = {
        active: false,
        click(event) {
            document.execCommand("insertOrderedList")
        },
        handler(event) {

        }
    }
    unOrderedList = {
        active: false,
        click(event) {
            document.execCommand("insertUnorderedList")
        },
        handler(event) {

        }
    }
    paragraph = {
        active: false,
        click(event) {
            document.execCommand("insertParagraph")
        },
        handler(event) {

        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                if (newValue) {
                    this.contents = newValue;

                    let handler = (event) => {
                        this.link.handler(event);
                        this.unLink.handler(event);
                        this.image.handler(event);
                        this.horizontalRule.handler(event);
                        this.text.handler(event);
                        this.orderedList.handler(event);
                        this.unOrderedList.handler(event);
                        this.paragraph.handler(event);
                    }

                    this.contents.addEventListener("click", handler);
                    this.contents.addEventListener("removed", () => {
                        this.contents.removeEventListener("click", handler);
                    });
                }
            }
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/toolbar/toolbar-inserts.html")
    }

}

export default customComponents.define("toolbar-inserts", ToolbarInserts)