import {customViews} from "../../../library/simplicity/simplicity.js";
import {jsonClient} from "../../../library/simplicity/services/client.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import CommonExample from "./slot/example.js";

class CommonImplicit extends HTMLElement {

    page = 0;

    materials = {};

    static get components() {
        return [DomCode, MatTabs, MatTab, MatPages, MatPage, CommonExample]
    }

    static get template() {
        return loader("documentation/basic/control-structure/slot.html")
    }

}

export default customViews.define({
    name : "control-structures-implicit",
    class : CommonImplicit,
    guard(activeRoute) {
        return {
            materials : jsonClient.get("materials.json")
        }
    }
})