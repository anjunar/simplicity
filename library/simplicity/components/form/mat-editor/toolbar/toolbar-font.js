import {customComponents} from "../../../../simplicity.js";
import {lifeCycle} from "../../../../processors/life-cycle-processor.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomSelect from "../../../../directives/dom-select.js";

class ToolbarFont extends HTMLElement {

    contents;

    fontName = "none"
    fontSize = "none"
    formatBlock = "none";

    bold
    italic
    strikeThrough
    subScript
    superScript;

    fontSizeTranslate(number) {
        switch (number) {
            case 9 : return "0"
            case 10 : return "1"
            case 13 : return "2"
            case 16 : return "3"
            case 18 : return "4"
            case 32 : return "5"
            default : return "none";
        }
    }

    formatBlockRestriction(localName) {
        switch (localName) {
            case "h1" : return "H1"
            case "h2" : return "H2"
            case "h3" : return "H3"
            case "h4" : return "H4"
            case "h5" : return "H5"
            case "h6" : return "H6"
            default : return "none";
        }
    }

    initialize() {

        this.contents.addEventListener("click", (event) => {
            let computedStyle = window.getComputedStyle(event.target);

            this.fontAdjustUpper(computedStyle, event);
            this.fontAdjustLower(computedStyle);

            lifeCycle(this);
        })
    }

    fontAdjustUpper(computedStyle, selection) {

        function rgbToHex(color) {
            color = "" + color;
            if (!color || color.indexOf("rgb") < 0) {
                return;
            }

            if (color.charAt(0) === "#") {
                return color;
            }

            let nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
                r = parseInt(nums[2], 10).toString(16),
                g = parseInt(nums[3], 10).toString(16),
                b = parseInt(nums[4], 10).toString(16);

            return "#" + (
                (r.length === 1 ? "0" + r : r) +
                (g.length === 1 ? "0" + g : g) +
                (b.length === 1 ? "0" + b : b)
            );
        }

        let regex = /(\d+).*/

        this.fontName = computedStyle.fontFamily.replace(/"/g, "") || "none";
        let number = Number.parseInt(regex.exec(computedStyle.fontSize)[1]);
        this.fontSize = this.fontSizeTranslate(number);
        this.formatBlock = this.formatBlockRestriction(selection.localName);
    }

    fontAdjustLower(computedStyle) {
        if (computedStyle.fontWeight === "700") {
            this.bold.classList.add("active");
        } else {
            this.bold.classList.remove("active");
        }

        if (computedStyle.fontStyle === "italic") {
            this.italic.classList.add("active");
        } else {
            this.italic.classList.remove("active");
        }

        if (computedStyle.textDecorationLine === "line-through") {
            this.strikeThrough.classList.add("active");
        } else {
            this.strikeThrough.classList.remove("active");
        }

        if (computedStyle.verticalAlign === "sub") {
            this.subScript.classList.add("active");
        } else {
            this.subScript.classList.remove("active");
        }

        if (computedStyle.verticalAlign === "super") {
            this.superScript.classList.add("active");
        } else {
            this.superScript.classList.remove("active");
        }
    }

    fontUpperClick() {
        let selection = window.getSelection();
        let parentElement = selection.anchorNode.parentElement;
        let computedStyle = window.getComputedStyle(parentElement);
        this.fontAdjustUpper(computedStyle, parentElement);
    }

    fontLowerClick() {
        let selection = window.getSelection();
        let parentElement = selection.anchorNode.parentElement;
        let computedStyle = window.getComputedStyle(parentElement);
        this.fontAdjustLower(computedStyle);
    }


    fontNameClick(event) {
        this.dispatchEvent(new CustomEvent("fontname", {detail : {select : event.target.value}}))
        this.fontUpperClick(event)
    }

    fontSizeClick(event) {
        this.dispatchEvent(new CustomEvent("fontsize", {detail : {select : event.target.value}}))
        this.fontUpperClick(event)
    }

    formatBlockClick(event) {
        this.dispatchEvent(new CustomEvent("formatblock", {detail : {select : event.target.value}}))
        this.fontUpperClick(event)
    }




    boldClick() {
        this.dispatchEvent(new CustomEvent("bold"))
        this.fontLowerClick();
    }

    italicClick() {
        this.dispatchEvent(new CustomEvent("italic"))
        this.fontLowerClick();
    }

    strikethroughClick() {
        this.dispatchEvent(new CustomEvent("strikethrough"))
        this.fontLowerClick();
    }

    subscriptClick() {
        this.dispatchEvent(new CustomEvent("subscript"))
        this.fontLowerClick();
    }

    superscriptClick() {
        this.dispatchEvent(new CustomEvent("supscript"));
        this.fontLowerClick();
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
            name : "contents",
            type : "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-font.html")
    }



}

export default customComponents.define("toolbar-font", ToolbarFont)