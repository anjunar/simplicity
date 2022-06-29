import {customViews} from "../../library/simplicity-core/simplicity.js";
import {loader} from "../../library/simplicity-core/processors/loader-processor.js";
import DomRouter from "../../library/simplicity-core/directives/dom-router.js";
import MatToolbar from "../../library/simplicity-material/components/navigation/mat-toolbar.js";
import MatDrawerContainer from "../../library/simplicity-material/components/navigation/mat-drawer-container.js";
import MatDrawerContent from "../../library/simplicity-material/components/navigation/mat-drawer-content.js";
import MatDrawer from "../../library/simplicity-material/components/navigation/mat-drawer.js";

class Index extends HTMLElement {

    open = false

    preInitialize() {
        let media = window.matchMedia("(max-width: 800px)")
        if (! media.matches) {
            this.open = true;
        }
    }

    static get components() {
        return [DomRouter, MatToolbar, MatDrawerContainer, MatDrawerContent, MatDrawer];
    }

    static get template() {
        return loader("documentation/basic/index.html")
    }
}

export default customViews.define({
    name : "app-advanced",
    class : Index
})