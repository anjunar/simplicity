import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";
import DomCode from "../../../library/simplicity-core/directives/dom-code.js";
import MatDrawer from "../../../library/simplicity-material/components/navigation/mat-drawer.js";
import MatDrawerContent from "../../../library/simplicity-material/components/navigation/mat-drawer-content.js";
import MatDrawerContainer from "../../../library/simplicity-material/components/navigation/mat-drawer-container.js";

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