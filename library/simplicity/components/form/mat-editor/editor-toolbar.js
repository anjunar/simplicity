import {customComponents} from "../../../simplicity.js";
import {loader} from "../../../processors/loader-processor.js";
import ToolbarColors from "./toolbar/toolbar-colors.js";
import ToolbarFont from "./toolbar/toolbar-font.js";
import ToolbarInserts from "./toolbar/toolbar-inserts.js";
import ToolbarJustify from "./toolbar/toolbar-justify.js";
import ToolbarTools from "./toolbar/toolbar-tools.js";
import MatTabs from "../../navigation/mat-tabs.js";
import MatTab from "../../navigation/mat-tab.js";
import MatPage from "../../navigation/mat-page.js";
import MatPages from "../../navigation/mat-pages.js";

class EditorToolbar extends HTMLElement {

    contents;
    page = 0;

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return [ToolbarColors, ToolbarFont, ToolbarInserts, ToolbarJustify, ToolbarTools, MatTabs, MatTab, MatPages, MatPage]
    }

    static get observedAttributes() {
        return [{
            name: "contents",
            type: "input"
        }]
    }

    static get template() {
        return loader("library/simplicity/components/form/mat-editor/editor-toolbar.html")
    }

}

export default customComponents.define("editor-toolbar", EditorToolbar)