import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class Component extends HTMLElement {

    page = 0;

    text = "Hello World!"

    static get components() {
        return [DomCode, MatPages, MatPage, MatTabs, MatTab]
    }

    static get template() {
        return loader("documentation/basic/getting-started/component.html")
    }

}

export default customViews.define({
    name: "architecture-custom-component",
    class: Component
})