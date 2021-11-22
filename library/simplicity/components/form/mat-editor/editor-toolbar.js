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
import ToolbarTable from "./toolbar/toolbar-table.js";
import ToolbarFlexbox from "./toolbar/toolbar-flexbox.js";

class EditorToolbar extends HTMLElement {

    contents;
    page = 0;

    fontNameClick(event) {
        this.dispatchEvent(new CustomEvent("fontname", {detail: event.detail}))
    }

    fontSizeClick(event) {
        this.dispatchEvent(new CustomEvent("fontsize", {detail: event.detail}))
    }

    formatBlockClick(event) {
        this.dispatchEvent(new CustomEvent("formatblock", {detail: event.detail}))
    }

    boldClick() {
        this.dispatchEvent(new CustomEvent("bold"))
    }

    italicClick() {
        this.dispatchEvent(new CustomEvent("italic"))
    }

    strikethroughClick() {
        this.dispatchEvent(new CustomEvent("strikethrough"))
    }

    subscriptClick() {
        this.dispatchEvent(new CustomEvent("subscript"));
    }

    superscriptClick() {
        this.dispatchEvent(new CustomEvent("superscript"))
    }

    colorClick(event) {
        this.dispatchEvent(new CustomEvent("color", {detail: event.detail}))
    }

    backGroundColorClick(event) {
        this.dispatchEvent(new CustomEvent("backgroundcolor", {detail: event.detail}))
    }


    justifyFullClick() {
        this.dispatchEvent(new CustomEvent("justifyfull"))
    }

    justifyLeftClick() {
        this.dispatchEvent(new CustomEvent("justifyleft"))
    }

    justifyRightClick() {
        this.dispatchEvent(new CustomEvent("justifyright"))
    }

    justifyCenterClick() {
        this.dispatchEvent(new CustomEvent("justifycenter"))
    }

    indentClick() {
        this.dispatchEvent(new CustomEvent("indent"))
    }

    outdentClick() {
        this.dispatchEvent(new CustomEvent("outdent"))
    }

    floatLeftClick() {
        this.dispatchEvent(new CustomEvent("floatleft"))
    }

    floatRightClick() {
        this.dispatchEvent(new CustomEvent("floatright"))
    }


    copyClick() {
        this.dispatchEvent(new CustomEvent("copy"))
    }

    cutClick() {
        this.dispatchEvent(new CustomEvent("cut"))
    }

    undoClick() {
        this.dispatchEvent(new CustomEvent("undo"))
    }

    deleteClick() {
        this.dispatchEvent(new CustomEvent("delete"))
    }

    selectAllClick() {
        this.dispatchEvent(new CustomEvent("selectall"))
    }

    redoClick() {
        this.dispatchEvent(new CustomEvent("redo"))
    }


    insertLinkClick() {
        this.dispatchEvent(new CustomEvent("insertlink"))
    }

    insertUnLinkClick() {
        this.dispatchEvent(new CustomEvent("insertunlink"))
    }

    insertImageClick() {
        this.dispatchEvent(new CustomEvent("insertimage"))
    }

    insertHorizontalRuleClick() {
        this.dispatchEvent(new CustomEvent("inserthorizontalrule"))
    }

    insertTextClick() {
        this.dispatchEvent(new CustomEvent("inserttext"))
    }

    insertOrderedListClick() {
        this.dispatchEvent(new CustomEvent("insertorderedlist"))
    }

    insertUnorderedListClick() {
        this.dispatchEvent(new CustomEvent("insertunorderedlist"))
    }

    insertDivFlexClick(event) {
        this.dispatchEvent(new CustomEvent("insertdivflex", {detail : event.detail}))
    }

    insertParagraphClick() {
        this.dispatchEvent(new CustomEvent("insertparagraph"))
    }


    insertTableClick(event) {
        this.dispatchEvent(new CustomEvent("inserttable", {detail : event.detail}))
    }

    addColumnClick() {
        this.dispatchEvent(new CustomEvent("addcolumn"))
    }

    addRowClick() {
        this.dispatchEvent(new CustomEvent("addrow"))
    }

    removeColumnClick() {
        this.dispatchEvent(new CustomEvent("removecolumn"))
    }

    removeRowClick() {
        this.dispatchEvent(new CustomEvent("removerow"))
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "contents" : {
                this.contents = newValue;
            }
        }
    }

    static get components() {
        return [ToolbarColors, ToolbarFont, ToolbarInserts, ToolbarJustify, ToolbarTools, ToolbarTable, ToolbarFlexbox, MatTabs, MatTab, MatPages, MatPage]
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