import {appManager} from "./manager/app-manager.js";
import * as plugins from "./plugins/index.js"

function traverse(routes) {
    if (routes.children) {
        for (const [name, route] of Object.entries(routes.children)) {
            if (route.file) {
                import("../../" + route.file)
            }
            traverse(route)
        }
    }
}

export function mountApp(appPath) {

    import("../../" + appPath)
        .then((module) => {
            let app = new module.default();
            app.id = "app"
            document.body.appendChild(app)

            window.setTimeout(() => {
                let routes = module.default.routes
                traverse(routes);
            }, 1000)
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

