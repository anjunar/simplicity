import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {windowManager} from "../../../library/simplicity/manager/window-manager.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import DomButton from "../../../library/simplicity/directives/dom-button.js";

class Dialog extends HTMLElement {

    page = 0;

    open() {
        windowManager.openWindow("/documentation/components/modals/dialog/example")
    }

    static get components() {
        return [DomButton, DomCode, MatPages, MatPage, MatTabs, MatTab]
    }

    static get template() {
        return loader("documentation/components/modals/dialog.html")
    }
}

export default customViews.define({
    name: "modals-dialog",
    class: Dialog
})