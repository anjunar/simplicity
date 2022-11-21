import {customViews} from "../../library/simplicity/simplicity.js";
import DomRouter from "../../library/simplicity/directives/dom-router.js";
import MatToolbar from "../../library/simplicity/components/navigation/mat-toolbar.js";
import MatDrawerContainer from "../../library/simplicity/components/navigation/mat-drawer-container.js";
import MatDrawerContent from "../../library/simplicity/components/navigation/mat-drawer-content.js";
import MatDrawer from "../../library/simplicity/components/navigation/mat-drawer.js";
import {loader} from "../../library/simplicity/util/loader.js";

class Index extends HTMLElement {

    open = false

    initialize() {
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