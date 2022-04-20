import {customComponents} from "../library/simplicity/simplicity.js";
import {loader} from "../library/simplicity/processors/loader-processor.js";
import DomRouter from "../library/simplicity/directives/dom-router.js"
import MatToolbar from "../library/simplicity/components/navigation/mat-toolbar.js";
import MatFooter from "../library/simplicity/components/navigation/mat-footer.js";
import MatPerformance from "../library/simplicity/components/system/mat-performance.js";
import MatLanguage from "../library/simplicity/components/system/mat-language.js";
import MatTaskbar from "../library/simplicity/components/system/mat-taskbar.js";

export default class DocumentationApp extends HTMLElement {

    active(value) {
        let method = () => {
            return window.location.hash.startsWith(`#/documentation/${value}/index`)
        }
        let resonator = (callback) => {
            window.addEventListener("hashchange", callback)
        }
        return {method, resonator}
    }

    static get components() {
        return [DomRouter, MatToolbar, MatFooter, MatPerformance, MatLanguage, MatTaskbar];
    }

    static get template() {
        return loader("documentation/app.html");
    }
}

customComponents.define("app-documentation", DocumentationApp);

