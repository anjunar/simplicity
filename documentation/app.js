import {customComponents} from "../library/simplicity-core/simplicity.js";
import {loader} from "../library/simplicity-core/processors/loader-processor.js";
import DomRouter from "../library/simplicity-core/directives/dom-router.js"
import MatToolbar from "../library/simplicity-material/components/navigation/mat-toolbar.js";
import MatFooter from "../library/simplicity-material/components/navigation/mat-footer.js";
import MatLanguage from "../library/simplicity-material/components/system/mat-language.js";
import MatTaskbar from "../library/simplicity-material/components/system/mat-taskbar.js";
import MatProgressBar from "../library/simplicity-material/components/indicators/mat-progress-bar.js";
import {appManager} from "../library/simplicity-core/manager/app-manager.js";
import {routes} from "./routes.js";

class DocumentationApp extends HTMLElement {

    loading = true;
    timeStamp;

    initialize() {
        window.addEventListener("click", (event) => {
            let aElement = event.path.find((element) => element.localName === "a" && element.hasAttribute("href"));
            if (aElement) {
                event.stopPropagation();
                event.preventDefault();
                let url = aElement.getAttribute("href").substring(1);
                let urlWithPath = "/" + appManager.context + url;
                history.pushState(null, null, urlWithPath)
                window.dispatchEvent(new Event("popstate"));
                return false;
            }
            return true;
        })
    }

    active(value) {
        let method = () => {
            return window.location.pathname.startsWith(`/simplicity/${value}`)
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

