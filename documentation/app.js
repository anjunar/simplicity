import {customComponents} from "../library/simplicity-core/simplicity.js";
import {loader} from "../library/simplicity-core/processors/loader-processor.js";
import DomRouter from "../library/simplicity-core/directives/dom-router.js"
import MatToolbar from "../library/simplicity-material/components/navigation/mat-toolbar.js";
import MatFooter from "../library/simplicity-material/components/navigation/mat-footer.js";
import MatPerformance from "../library/simplicity-material/components/system/mat-performance.js";
import MatLanguage from "../library/simplicity-material/components/system/mat-language.js";
import MatTaskbar from "../library/simplicity-material/components/system/mat-taskbar.js";
import MatProgressBar from "../library/simplicity-material/components/indicators/mat-progress-bar.js";

class DocumentationApp extends HTMLElement {

    loading = true;
    timeStamp;

    active(value) {
        let method = () => {
            return window.location.hash.startsWith(`#/documentation/${value}/index`)
        }
        let resonator = (callback) => {
            window.addEventListener("hashchange", callback)
        }
        return {method, resonator}
    }

    load() {
        this.loading = true
        this.timeStamp = performance.now();
    }

    loadEnd() {
        this.loading = false
        let delta = performance.now() - this.timeStamp;
        console.log("page load: " + Math.round(delta) + "ms")
    }

    static get components() {
        return [DomRouter, MatToolbar, MatFooter, MatPerformance, MatLanguage, MatTaskbar, MatProgressBar];
    }

    static get template() {
        return loader("documentation/app.html");
    }
}

export default customComponents.define("app-documentation", DocumentationApp);

