import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../../../simplicity-core/directives/dom-select.js";
import {membraneFactory} from "../../../../../simplicity-core/processors/html-compiler-processor.js";

class ToolbarFont extends HTMLElement {

    contents;

    fontName = {
        value: "Helvetica, serif",
        click(event) {
            document.execCommand("fontname", false, event.target.value);
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.value = computedStyle.fontFamily.replace(/"/g, "") || "none";
        }
    }
    fontSize = {
        value: "3",
        click(event) {
            document.execCommand("fontSize", false, event.target.value);
        },
        handler(event) {
            function fontSizeTranslate(number) {
                switch (number) {
                    case 9 :
                        return "0"
                    case 10 :
                        return "1"
                    case 13 :
                        return "2"
                    case 16 :
                        return "3"
                    case 18 :
                        return "4"
                    case 32 :
                        return "5"
                    default :
                        return "none";
                }
            }

            let computedStyle = window.getComputedStyle(event.target);
            let regex = /(\d+).*/
            let number = Number.parseInt(regex.exec(computedStyle.fontSize)[1]);
            this.value = fontSizeTranslate(number);
        }
    }
    formatBlock = {
        value: "none",
        click(event) {
            document.execCommand("formatBlock", false, event.target.value)
        },
        handler(event) {
            function formatBlockRestriction(localName) {
                switch (localName) {
                    case "h1" :
                        return "H1"
                    case "h2" :
                        return "H2"
                    case "h3" :
                        return "H3"
                    case "h4" :
                        return "H4"
                    case "h5" :
                        return "H5"
                    case "h6" :
                        return "H6"
                    default :
                        return "none";
                }
            }

            this.value = formatBlockRestriction(event.target.localName);
        }
    };

    bold = {
        active: false,
        click() {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand('bold', false, null);
            this.active = true;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.fontWeight === "700";
        }
    }
    italic = {
        active: false,
        click() {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("italic", false, null);
            this.active = true;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.fontStyle === "italic";
        }
    }
    strikeThrough = {
        active: false,
        click() {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("strikethrough", false, null);
            this.active = true;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.textDecorationLine === "line-through";
        }
    }
    subScript = {
        active: false,
        click() {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("subscript", false, null);
            this.active = true;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.verticalAlign === "sub";
        }
    }
    superScript = {
        active: false,
        click() {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("superscript", false, null);
            this.active = true;
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.active = computedStyle.verticalAlign === "super";
        }
    }

    initialize() {
        let handler = (event) => {
            this.fontName.handler(event);
            this.fontSize.handler(event);
            this.formatBlock.handler(event);
            this.bold.handler(event);
            this.italic.handler(event);
            this.strikeThrough.handler(event);
            this.subScript.handler(event);
            this.superScript.handler(event);
        }

        this.contents.addEventListener("click", handler);

        ToolbarFont.prototype.destroy = () => {
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
        return [DomSelect]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/form/mat-editor/toolbar/toolbar-font.html")
    }


}

export default customComponents.define("toolbar-font", ToolbarFont)