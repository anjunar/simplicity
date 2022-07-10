import {customViews} from "../../../library/simplicity-core/simplicity.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomRouter from "../../../library/simplicity-core/directives/dom-router.js";
import MatPages from "../../../library/simplicity-material/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity-material/components/navigation/mat-page.js";
import MatTabs from "../../../library/simplicity-material/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity-material/components/navigation/mat-tab.js";

class Router extends HTMLElement {

    page = 0;

    static get components() {
        return [DomCode, DomRouter, MatPages, MatPage, MatTabs, MatTab]
    }

    static get template() {
        return loader("documentation/components/navigation/router.html")
    }

}

export default customViews.define({
    name: "navigation-router",
    class: Router
})