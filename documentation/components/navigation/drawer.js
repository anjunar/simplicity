import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import MatDrawer from "../../../library/simplicity/components/navigation/mat-drawer.js";
import MatDrawerContent from "../../../library/simplicity/components/navigation/mat-drawer-content.js";
import MatDrawerContainer from "../../../library/simplicity/components/navigation/mat-drawer-container.js";

class Drawer extends HTMLElement {

    open = false

    static get components() {
        return [DomCode, MatDrawer, MatDrawerContent, MatDrawerContainer]
    }

    static get template() {
        return loader("documentation/components/navigation/drawer.html")
    }
}

export default customViews.define({
    name: "navigation-drawer",
    class: Drawer
})