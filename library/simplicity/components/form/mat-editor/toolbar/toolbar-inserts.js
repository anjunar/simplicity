import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";

class ToolbarInserts extends HTMLElement {

    content;

    link
    unLink;

    initialize() {
        this.content.addEventListener("click", (event) => {
            let selection = window.getSelection();
            if (selection.anchorNode) {
                let parentElement = selection.anchorNode.parentElement;
                switch (parentElement.localName) {
                    case "a" : {
                        this.link.classList.add("active");
                    } break;
                    default : {
                        this.link.classList.remove("active")
                    }
                }
            }
        })
    }

    insertLinkClick() {
        this.dispatchEvent(new CustomEvent("insertlink"))
    }

    insertUnLinkClick() {
        this.dispatchEvent(new CustomEvent("insertunlink"))
    }

    insertImageClick() {
        this.dispatchEvent(new CustomEvent("insertimage"))
    }

    insertHorizontalRuleClick() {
        this.dispatchEvent(new CustomEvent("inserthorizontalrule"))
    }

    insertTextClick() {
        this.dispatchEvent(new CustomEvent("inserttext"))
    }

    insertTableClick(columnsSize) {
        this.dispatchEvent(new CustomEvent("inserttable"))
    }

    insertOrderedListClick() {
        this.dispatchEvent(new CustomEvent("insertorderedlist"))
    }

    insertUnorderedListClick() {
        this.dispatchEvent(new CustomEvent("insertunorderedlist"))
    }

    insertDivFlexClick() {
        this.dispatchEvent(new CustomEvent("insertdivflex"))
    }

    insertParagraphClick() {
        this.dispatchEvent(new CustomEvent("insertparagraph"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "content" : {
                this.content = newValue;
            }
        }
    }

    static get components() {
        return []
    }

    static get observedAttributes() {
        return [{
            name : "content",
            type : "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-inserts.html")
    }

}

export default customComponents.define("toolbar-inserts", ToolbarInserts)