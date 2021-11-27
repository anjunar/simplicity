import {customComponents} from "../library/simplicity/simplicity.js";
import {loader} from "../library/simplicity/processors/loader-processor.js";
import DomRouter from "../library/simplicity/directives/dom-router.js"
import MatToolbar from "../library/simplicity/components/navigation/mat-toolbar.js";
import MatFooter from "../library/simplicity/components/navigation/mat-footer.js";
import MatPerformance from "../library/simplicity/components/system/mat-performance.js";

export default class DocumentationApp extends HTMLElement {

    active(value) {
        return window.location.hash.startsWith(`#/documentation/${value}/index`)
    }

    static get components() {
        return [DomRouter, MatToolbar, MatFooter, MatPerformance];
    }

    static get template() {
        return loader("documentation/app.html");
    }
}

customComponents.define("app-documentation", DocumentationApp);

