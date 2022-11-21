import {customComponents} from "../../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../../simplicity-core/processors/loader-processor.js";
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

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                if (newValue) {
                    this.contents = newValue;
                    let handler = (event) => {
                        this.color.handler(event);
                        this.backGroundColor.handler(event);
                    }

                    this.contents.addEventListener("click", handler);
                    this.contents.addEventListener("removed", () => {
                        this.contents.removeEventListener("click", handler);
                    })
                }
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
        return libraryLoader("simplicity-material/components/form/mat-editor/toolbar/toolbar-colors.html")
    }


}

export default customComponents.define("toolbar-colors", ToolbarColors)