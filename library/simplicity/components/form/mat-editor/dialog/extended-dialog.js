import {customViews} from "../../../../../simplicity/simplicity.js";
import MatTabs from "../../../navigation/mat-tabs.js";
import MatTab from "../../../navigation/mat-tab.js";
import MatPages from "../../../navigation/mat-pages.js";
import MatPage from "../../../navigation/mat-page.js";
import MarginsNode from "./extended-dialog/margins-node.js";
import PaddingNode from "./extended-dialog/padding-node.js";
import SizingNode from "./extended-dialog/sizing-node.js";
import FlexBoxNode from "./extended-dialog/flex-box-node.js";
import {libraryLoader} from "../../../../util/loader.js";

class ExtendedDialog extends HTMLElement {

    page = 0;

    path = [];

    static get components() {
        return [MatTabs, MatTab, MatPages, MatPage, MarginsNode, PaddingNode, SizingNode, FlexBoxNode]
    }

    static get template() {
        return libraryLoader("simplicity/components/form/mat-editor/dialog/extended-dialog.html")
    }

}

export default customViews.define({
    name : "context-dialog",
    class : ExtendedDialog,
    header : "Inspector",
    width : "600px"
})