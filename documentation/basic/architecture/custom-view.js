import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import DomInput from "../../../library/simplicity/directives/dom-input.js";
import MatPages from "../../../library/simplicity/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity/components/navigation/mat-page.js";
import MatTabs from "../../../library/simplicity/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity/components/navigation/mat-tab.js";

class CustomView extends HTMLElement {

    page = 0;

    static get components() {
        return [DomCode, DomInput, MatPages, MatPage, MatTabs, MatTab]
    }

    static get template() {
        return loader("documentation/basic/architecture/custom-view.html");
    }

}

export default customViews.define({
    name: "architecture-custom-view",
    class: CustomView
})