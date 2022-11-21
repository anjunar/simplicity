import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";

class Tabs extends HTMLElement {

    page = 0;

    static get components() {
        return [DomCode, MatTabs, MatTab, MatPages, MatPage]
    }

    static get template() {
        return loader("documentation/components/navigation/tabs.html")
    }
}

export default customViews.define({
    name : "navigation-tabs",
    class : Tabs
})