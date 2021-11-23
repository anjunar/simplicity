import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";
import MatInputContainer from "../../container/mat-input-container.js";
import DomInput from "../../../../directives/dom-input.js";
import DomSelect from "../../../../directives/dom-select.js";

class ToolbarFlexbox extends HTMLElement {

    contents;

    columns = {
        disabled : false,
        value : 2
    }

    insertDivFlex = {
        disabled : false,
        click : (columns) => {
            let columnsHTML = ""
            for (let i = 0; i < columns; i++) {
                columnsHTML += "<div></div>"
            }

            let html = "<div class='flex'>" + columnsHTML + "</div>"

            document.execCommand("insertHTML", false, html)
        }
    }

    addColumn = {
        disabled : true,
        click : () => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let flexbox = node.queryUpwards((node) => node.localName === "div" && node.className === "flex")
            flexbox.appendChild(document.createElement("div"))
        },
        handler : (event) => {
            let flexElement = event.path.find((segment) => segment.className === "flex");
            this.addColumn.disabled = ! flexElement;
        }
    }

    removeColumn = {
        disabled: true,
        click : () => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let flexbox = node.queryUpwards((node) => node.localName === "div" && node.className === "flex")
            flexbox.lastElementChild.remove();
        },
        handler : (event) => {
            let flexElement = event.path.find((segment) => segment.className === "flex");
            this.removeColumn.disabled = ! flexElement;
        }
    }

    justifyContent = {
        disabled: true,
        value : "normal",
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let flexbox = node.queryUpwards((node) => node.localName === "div" && node.className === "flex")
            flexbox.style.justifyContent = event.target.value;
        },
        handler : (event) => {
            let flexElement = event.path.find((segment) => segment.className === "flex");
            if (flexElement) {
                let computedStyle = window.getComputedStyle(flexElement);
                this.justifyContent.value = computedStyle.justifyContent;
            }
            this.justifyContent.disabled = ! flexElement;
        }
    }

    alignItems = {
        disabled: true,
        value : "stretch",
        click : (event) => {
            let selection = document.getSelection();
            let rangeAt = selection.getRangeAt(0);
            let node = rangeAt.commonAncestorContainer;
            let flexbox = node.queryUpwards((node) => node.localName === "div" && node.className === "flex")
            flexbox.style.alignItems = event.target.value;
        },
        handler : (event) => {
            let flexElement = event.path.find((segment) => segment.className === "flex");
            if (flexElement) {
                let computedStyle = window.getComputedStyle(flexElement);
                this.alignItems.value = computedStyle.alignItems;
            }
            this.alignItems.disabled = ! flexElement;
        }
    };

    inputs = [this.addColumn, this.removeColumn, this.justifyContent, this.alignItems]

    initialize() {

        let handler = (event) => {
            for (const input of this.inputs) {
                input.handler(event)
            }
        }

        this.contents.addEventListener("click", handler);

        ToolbarFlexbox.prototype.destroy = () => {
            this.contents.removeEventListener("click", handler);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return [MatInputContainer, DomInput, DomSelect]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-flexbox.html")
    }


}

export default customComponents.define("toolbar-flexbox", ToolbarFlexbox)