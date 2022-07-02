import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../../../simplicity-core/directives/dom-select.js";

class ToolbarColors extends HTMLElement {

    contents;

    color = {
        value : "none",
        click(event) {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("foreColor", false, event.target.value)
        },
        handler(event) {
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

            let computedStyle = window.getComputedStyle(event.target);

            this.value = rgbToHex(computedStyle.color) || "none";
        }
    };

    backGroundColor = {
        value : "rgba(0, 0, 0, 0)",
        click(event) {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("backColor", false, event.target.value);
        },
        handler(event) {
            let computedStyle = window.getComputedStyle(event.target);
            this.value = computedStyle.backgroundColor || "none";
        }
    };

    inputs = [this.color, this.backGroundColor];

    initialize() {
        let handler = (event) => {
            for (const input of this.inputs) {
                input.handler(event)
            }
        }

        this.contents.addEventListener("click", handler);

        ToolbarColors.prototype.destroy = () => {
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
        return loader("library/simplicity-material/components/form/mat-editor/toolbar/toolbar-colors.html")
    }


}

export default customComponents.define("toolbar-colors", ToolbarColors)