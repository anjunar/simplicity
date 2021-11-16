import {customComponents} from "../../../../simplicity.js";
import {lifeCycle} from "../../../../processors/life-cycle-processor.js";
import {loader} from "../../../../processors/loader-processor.js";

class ToolbarJustify extends HTMLElement {

    contents;

    justify
    justifyLeft
    justifyRight
    justifyCenter;

    indent
    outdent
    floatLeft
    floatRight;

    initialize() {

        this.contents.addEventListener("click", (event) => {
            let computedStyle = window.getComputedStyle(event.target);

            let textAlign = computedStyle.textAlign;
            if (textAlign === "justify") {
                this.justify.classList.add("active");
            } else {
                this.justify.classList.remove("active");
            }

            if (textAlign === "left") {
                this.justifyLeft.classList.add("active");
            } else {
                this.justifyLeft.classList.remove("active");
            }

            if (textAlign === "right") {
                this.justifyRight.classList.add("active");
            } else {
                this.justifyRight.classList.remove("active");
            }

            if (textAlign === "center") {
                this.justifyCenter.classList.add("active");
            } else {
                this.justifyCenter.classList.remove("active");
            }

            let selection = window.getSelection();
            if (selection.anchorNode) {
                let parentElementParentElement = selection.anchorNode.parentElement.parentElement;
                if (parentElementParentElement.localName === "blockquote") {
                    this.indent.classList.add("active");
                } else {
                    this.indent.classList.remove("active")
                }
            }

            let float = computedStyle.float
            switch (float) {
                case "left" : {
                    this.floatLeft.classList.add("active")
                    this.floatRight.classList.remove("active")
                } break
                case "right" : {
                    this.floatLeft.classList.remove("active")
                    this.floatRight.classList.add("active")
                } break;
                default : {
                    this.floatLeft.classList.remove("active")
                    this.floatRight.classList.remove("active")
                }
            }

            lifeCycle(this);
        })
    }

    justifyFullClick() {
        this.dispatchEvent(new CustomEvent("justifyfull"))
        this.justify.classList.add("active")
        this.justifyLeft.classList.remove("active")
        this.justifyRight.classList.remove("active")
        this.justifyCenter.classList.remove("active")
    }

    justifyLeftClick() {
        this.dispatchEvent(new CustomEvent("justifyleft"))
        this.justify.classList.remove("active")
        this.justifyLeft.classList.add("active")
        this.justifyRight.classList.remove("active")
        this.justifyCenter.classList.remove("active")
    }

    justifyRightClick() {
        this.dispatchEvent(new CustomEvent("justifyright"))
        this.justify.classList.remove("active")
        this.justifyLeft.classList.remove("active")
        this.justifyRight.classList.add("active")
        this.justifyCenter.classList.remove("active")
    }

    justifyCenterClick() {
        this.dispatchEvent(new CustomEvent("justifycenter"))
        this.justify.classList.remove("active")
        this.justifyLeft.classList.remove("active")
        this.justifyRight.classList.remove("active")
        this.justifyCenter.classList.add("active")
    }

    indentClick() {
        this.dispatchEvent(new CustomEvent("indent"))
        this.indent.classList.add("active")
    }

    outdentClick() {
        this.dispatchEvent(new CustomEvent("outdent"))
        this.outdent.classList.add("active")
    }

    floatLeftClick() {
        this.dispatchEvent(new CustomEvent("floatleft"))
        let selection = window.getSelection();
        let computedStyle = window.getComputedStyle(selection.anchorNode);

        let float = computedStyle.float
        switch (float) {
            case "left" : {
                this.floatLeft.classList.add("active")
                this.floatRight.classList.remove("active")
            } break
            case "right" : {
                this.floatLeft.classList.remove("active")
                this.floatRight.classList.add("active")
            } break;
            default : {
                this.floatLeft.classList.remove("active")
                this.floatRight.classList.remove("active")
            }
        }
    }

    floatRightClick() {
        this.dispatchEvent(new CustomEvent("floatright"))
        let selection = window.getSelection();
        let computedStyle = window.getComputedStyle(selection.anchorNode);
        let float = computedStyle.float
        switch (float) {
            case "left" : {
                this.floatLeft.classList.add("active")
                this.floatRight.classList.remove("active")
            } break
            case "right" : {
                this.floatLeft.classList.remove("active")
                this.floatRight.classList.add("active")
            } break;
            default : {
                this.floatLeft.classList.remove("active")
                this.floatRight.classList.remove("active")
            }
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
        return []
    }

    static get observedAttributes() {
        return [{
            name : "contents",
            type : "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-justify.html")
    }


}

export default customComponents.define("toolbar-justify", ToolbarJustify)