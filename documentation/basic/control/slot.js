import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-material/directives/dom-code.js";
import MatTabs from "../../../library/simplicity-material/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity-material/components/navigation/mat-tab.js";
import MatPages from "../../../library/simplicity-material/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity-material/components/navigation/mat-page.js";
import CommonExample from "./slot/example.js";

class CommonImplicit extends HTMLElement {

    page = 0;

    materials = {};

    static get components() {
        return [DomCode, MatTabs, MatTab, MatPages, MatPage, CommonExample]
    }

    static get template() {
        return loader("documentation/basic/control/slot.html")
    }

}

export default customViews.define({
    name : "control-structures-implicit",
    class : CommonImplicit,
    guard(activeRoute) {
        return {
            materials : fetch("materials.json").then(response => response.json())
        }
    }
})