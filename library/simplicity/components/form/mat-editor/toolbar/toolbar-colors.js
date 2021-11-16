import {customComponents} from "../../../../simplicity.js";
import {lifeCycle} from "../../../../processors/life-cycle-processor.js";
import {loader} from "../../../../processors/loader-processor.js";
import DomSelect from "../../../../directives/dom-select.js";

class ToolbarColors extends HTMLElement {

    contents;
    color = "none";
    backGroundColor = "none";

    initialize() {

        this.contents.addEventListener("click", (event) => {
            function rgbToHex(color) {
                color = ""+ color;
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

                return "#"+ (
                    (r.length === 1 ? "0"+ r : r) +
                    (g.length === 1 ? "0"+ g : g) +
                    (b.length === 1 ? "0"+ b : b)
                );
            }

            let computedStyle = window.getComputedStyle(event.target);

            this.color = rgbToHex(computedStyle.color) || "none";
            this.backGroundColor = computedStyle.backgroundColor || "none";


            lifeCycle(this);
        })
    }

    backGroundColorClick(event) {
        this.dispatchEvent(new CustomEvent("backgroundcolor", {detail : {select : event.target.value}}))
    }

    colorClick(event) {
        this.dispatchEvent(new CustomEvent("color", {detail : {select : event.target.value}}))
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
        return loader("library/simplicity/components/form/mat-editor/toolbar/toolbar-colors.html")
    }


}

export default customComponents.define("toolbar-colors", ToolbarColors)