import {customComponents} from "../library/simplicity/simplicity.js";
import DomRouter from "../library/simplicity/directives/dom-router.js"
import MatToolbar from "../library/simplicity/components/navigation/mat-toolbar.js";
import MatFooter from "../library/simplicity/components/navigation/mat-footer.js";
import MatLanguage from "../library/simplicity/components/system/mat-language.js";
import MatTaskbar from "../library/simplicity/components/system/mat-taskbar.js";
import MatProgressBar from "../library/simplicity/components/indicators/mat-progress-bar.js";
import {appManager} from "../library/simplicity/manager/app-manager.js";
import {routes} from "./routes.js";
import {loader} from "../library/simplicity/util/loader.js";

class DocumentationApp extends HTMLElement {

    loading = true;
    timeStamp;

    get app() {
        return this;
    }

    initialize() {
        this.render();
    }

    active(value) {
        let method = () => {
            let baseElement = document.querySelector("base")
            let attribute = baseElement.getAttribute("href");
            return window.location.pathname.startsWith(`${attribute}${value}`)
        }
        let resonator = (callback) => {
            window.addEventListener("popstate", callback)
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
        if (appManager.mode === "development") {
            console.log("page load: " + Math.round(delta) + "ms")
        }
    }

    static get components() {
        return [DomRouter, MatToolbar, MatFooter, MatLanguage, MatTaskbar, MatProgressBar];
    }

    static get template() {
        return loader("documentation/app.html");
    }

    static get routes() {
        return routes;
    }
}

export default customComponents.define("app-documentation", DocumentationApp);

