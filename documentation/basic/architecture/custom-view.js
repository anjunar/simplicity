import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";
import DomInput from "../../../library/simplicity-core/directives/dom-input.js";
import MatPages from "../../../library/simplicity-material/components/navigation/mat-pages.js";
import MatPage from "../../../library/simplicity-material/components/navigation/mat-page.js";
import MatTabs from "../../../library/simplicity-material/components/navigation/mat-tabs.js";
import MatTab from "../../../library/simplicity-material/components/navigation/mat-tab.js";

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