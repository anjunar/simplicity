import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../../simplicity-core/processors/loader-processor.js";

class ToolbarJustify extends HTMLElement {

    contents;

    justify = {
        outer : this,
        active : false,
        click(event) {
            document.execCommand("justifyFull");
            this.active = true;

            this.outer.justifyLeft.active = false;
            this.outer.justifyRight.active = false;
            this.outer.justifyCenter.active = false;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.textAlign === "justify";
        }
    }
    justifyLeft = {
        outer : this,
        active : false,
        click(event) {
            document.execCommand("justifyLeft");
            this.active = true

            this.outer.justify.active = false;
            this.outer.justifyRight.active = false;
            this.outer.justifyCenter.active = false;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.textAlign === "left";
        }
    }
    justifyRight = {
        outer : this,
        active : false,
        click(event) {
            document.execCommand("justifyRight");
            this.active = true

            this.outer.justify.active = false;
            this.outer.justifyLeft.active = false;
            this.outer.justifyCenter.active = false;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.textAlign === "right";
        }
    }
    justifyCenter = {
        outer : this,
        active : false,
        click(event) {
            document.execCommand("justifyCenter");
            this.active = true

            this.outer.justify.active = false;
            this.outer.justifyLeft.active = false;
            this.outer.justifyRight.active = false;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.textAlign === "center";
        }
    }

    indent = {
        active : false,
        click(event) {
            document.execCommand("indent");
        },
        handler(event) {
            //Todo: Needs to be implemented
        }
    }
    outdent = {
        active : false,
        click(event) {
            document.execCommand("outdent");
        },
        handler(event) {
            //Todo: Needs to be implemented
        }
    }
    floatLeft = {
        active : false,
        click(event) {
            let selection = window.getSelection();
            let parentElement = selection.anchorNode.parentElement;

            let computedStyle = window.getComputedStyle(parentElement);

            if (computedStyle.float === "left") {
                parentElement.style.float = "";
                this.floatLeft.active = false;
            } else {
                parentElement.style.float = "left";
                this.floatLeft.active = true;
                this.floatRight.active = false;
            }
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.float === "left"
        }
    }
    floatRight = {
        active : false,
        click(event) {
            let selection = window.getSelection();
            let parentElement = selection.anchorNode.parentElement;

            let computedStyle = window.getComputedStyle(parentElement);

            if (computedStyle.float === "right") {
                parentElement.style.float = "";
                this.floatRight.active = false;
            } else {
                parentElement.style.float = "right";
                this.floatLeft.active = false;
                this.floatRight.active = true;
            }
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.float === "right"
        }
    }

    inputs = [this.justify, this.justifyLeft, this.justifyRight, this.justifyCenter, this.outdent, this.indent, this.floatLeft, this.floatRight];

    initialize() {
        let handler = (event) => {
            for (const input of this.inputs) {
                input.handler(event)
            }
        }

        this.contents.addEventListener("click", handler);

        ToolbarJustify.prototype.destroy = () => {
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
        return []
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            binding: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity-material/components/form/mat-editor/toolbar/toolbar-justify.html")
    }


}

export default customComponents.define("toolbar-justify", ToolbarJustify)