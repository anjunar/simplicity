import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {windowManager} from "../../../library/simplicity/manager/window-manager.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import DomButton from "../../../library/simplicity/directives/dom-button.js";

class Window extends HTMLElement {

    page = 0;

    open() {
        windowManager.openWindow("documentation/components/modals/window/example.js")
    }

    static get components() {
        return [DomButton, DomCode, MatTabs, MatTab, MatPages, MatPage]
    }

    static get template() {
        return loader("documentation/components/modals/window.html")
    }
}

export default customViews.define({
    name: "modals-window",
    class: Window
})