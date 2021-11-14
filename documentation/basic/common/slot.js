import {customViews} from "../../../library/simplicity/simplicity.js";
import {jsonClient} from "../../../library/simplicity/services/client.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import Repeat from "./slot/example.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";

class CommonImplicit extends HTMLElement {

    page = 0;

    materials = [];

    static get components() {
        return [Repeat, DomCode, MatTabs, MatTab, MatPages, MatPage]
    }

    static get template() {
        return loader("documentation/basic/common/slot.html")
    }

}

export default customViews.define({
    name : "common-implicit",
    class : CommonImplicit,
    guard(activeRoute) {
        return {
            materials : jsonClient.get("materials.json")
        }
    }
})