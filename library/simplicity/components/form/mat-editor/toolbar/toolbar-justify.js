import {customComponents} from "../../../../../simplicity/simplicity.js";
import {libraryLoader} from "../../../../util/loader.js";

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

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                if (newValue) {
                    let handler = (event) => {
                        this.justify.handler(event);
                        this.justifyLeft.handler(event);
                        this.justifyRight.handler(event);
                        this.justifyCenter.handler(event);
                        this.outdent.handler(event);
                        this.indent.handler(event);
                        this.floatLeft.handler(event);
                        this.floatRight.handler(event);
                    }

                    newValue.addEventListener("click", handler);
                    if (oldValue) {
                        oldValue.removeEventListener("click", handler);
                    }
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
        return libraryLoader("simplicity/components/form/mat-editor/toolbar/toolbar-justify.html")
    }


}

export default customComponents.define("toolbar-justify", ToolbarJustify)