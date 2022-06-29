import {customViews} from "../../../../../simplicity-core/simplicity.js";
import {loader} from "../../../../../simplicity-core/processors/loader-processor.js";
import MatTabs from "../../../navigation/mat-tabs.js";
import MatTab from "../../../navigation/mat-tab.js";
import MatPages from "../../../navigation/mat-pages.js";
import MatPage from "../../../navigation/mat-page.js";
import MarginsNode from "./extended-dialog/margins-node.js";
import PaddingNode from "./extended-dialog/padding-node.js";
import SizingNode from "./extended-dialog/sizing-node.js";
import DomIf from "../../../../../simplicity-core/directives/dom-if.js";
import FlexBoxNode from "./extended-dialog/flex-box-node.js";

class ExtendedDialog extends HTMLElement {

    page = 0;

    path = [];

    static get components() {
        return [DomIf, MatTabs, MatTab, MatPages, MatPage, MarginsNode, PaddingNode, SizingNode, FlexBoxNode]
    }

    static get template() {
        return loader("library/simplicity-material/components/form/mat-editor/dialog/extended-dialog.html")
    }

}

export default customViews.define({
    name : "context-dialog",
    class : ExtendedDialog,
    header : "Inspector",
    width : "600px"
})