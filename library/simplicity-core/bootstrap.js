import {appManager} from "./manager/app-manager.js";
import * as plugins from "./plugins/index.js"

export function mountApp(appPath) {

    import("../../" + appPath)
        .then((module) => {
            document.body.appendChild(new module.default())
        })

}

export function bootstrap(options) {
    appManager.mode = options.mode || "production"
    appManager.library = options.library || "library"
    appManager.shadowDom = options.shadowDom || false

    if (appManager.mode === "development") {
        console.log(`plugins loaded: ${Object.values(plugins).map(plugin => plugin.name)}`)
    }
}

