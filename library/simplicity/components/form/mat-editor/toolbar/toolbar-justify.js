import {customComponents} from "../../../../simplicity.js";
import {loader} from "../../../../processors/loader-processor.js";

class ToolbarJustify extends HTMLElement {

    contents;

    justify = {
        active : false,
        click : (event) => {
            document.execCommand("justifyFull");
            this.justify.active = true;
            this.justifyLeft.active = false;
            this.justifyRight.active = false;
            this.justifyCenter.active = false;
        },
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.justify.active = computedStyle.textAlign === "justify";
        }
    }
    justifyLeft = {
        active : false,
        click : (event) => {
            document.execCommand("justifyLeft");
            this.justify.active = false;
            this.justifyLeft.active = true;
            this.justifyRight.active = false;
            this.justifyCenter.active = false;
        },
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.justifyLeft.active = computedStyle.textAlign === "left";
        }
    }
    justifyRight = {
        active : false,
        click : (event) => {
            document.execCommand("justifyRight");
            this.justify.active = false;
            this.justifyLeft.active = false;
            this.justifyRight.active = true;
            this.justifyCenter.active = false;
        },
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.justifyRight.active = computedStyle.textAlign === "right";
        }
    }
    justifyCenter = {
        active : false,
        click : (event) => {
            document.execCommand("justifyCenter");
            this.justify.active = false;
            this.justifyLeft.active = false;
            this.justifyRight.active = false;
            this.justifyCenter.active = true;
        },
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.justifyCenter.active = computedStyle.textAlign === "center";
        }
    }

    indent = {
        active : false,
        click : (event) => {
            document.execCommand("indent");
        },
        handler : (event) => {
            //Todo: Needs to be implemented
        }
    }
    outdent = {
        active : false,
        click : (event) => {
            document.execCommand("outdent");
        },
        handler : (event) => {
            //Todo: Needs to be implemented
        }
    }
    floatLeft = {
        active : false,
        click : (event) => {
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
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.floatLeft.active = computedStyle.float === "left"
        }
    }
    floatRight = {
        active : false,
        click : (event) => {
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
        handler : (event) => {
            let computedStyle = window.getComputedStyle(event.target);
            this.floatRight.active = computedStyle.float === "right"
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
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-justify.html")
    }


}

export default customComponents.define("toolbar-justify", ToolbarJustify)