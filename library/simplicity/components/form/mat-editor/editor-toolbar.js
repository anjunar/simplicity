import {customComponents} from "../../../../simplicity/simplicity.js";
import ToolbarColors from "./toolbar/toolbar-colors.js";
import ToolbarFont from "./toolbar/toolbar-font.js";
import ToolbarInserts from "./toolbar/toolbar-inserts.js";
import ToolbarJustify from "./toolbar/toolbar-justify.js";
import ToolbarTools from "./toolbar/toolbar-tools.js";
import MatTabs from "../../navigation/mat-tabs.js";
import MatTab from "../../navigation/mat-tab.js";
import MatPages from "../../navigation/mat-pages.js";
import MatPage from "../../navigation/mat-page.js";
import {libraryLoader} from "../../../util/loader.js";

class EditorToolbar extends HTMLElement {

    contents;
    page = 0;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                if (newValue) {
                    this.contents = newValue;
                }
            }
        }
    }

    static get components() {
        return [ToolbarColors, ToolbarFont, ToolbarInserts, ToolbarJustify, ToolbarTools, MatTabs, MatTab, MatPages, MatPage]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            binding: "input"
        }]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/editor-toolbar.html")
    }

}

export default customComponents.define("editor-toolbar", EditorToolbar)