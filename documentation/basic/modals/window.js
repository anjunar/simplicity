import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {windowManager} from "../../../library/simplicity/services/window-manager.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";

class Window extends HTMLElement {

    page = 0;

    open() {
        windowManager.openWindow("/documentation/basic/modals/window/example")
    }

    static get components() {
        return [DomCode, MatTabs, MatTab, MatPages, MatPage]
    }

    static get template() {
        return loader("documentation/basic/modals/window.html")
    }
}

export default customViews.define({
    name: "modals-window",
    class: Window
})