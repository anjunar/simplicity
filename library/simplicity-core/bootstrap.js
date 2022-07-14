import {appManager} from "./manager/app-manager.js";
import * as plugins from "./plugins/index.js"

function traverse(routes) {
    if (routes.children) {
        for (const route of Object.values(routes.children)) {
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

            if (appManager.preFetch) {
                window.setTimeout(() => {
                    let routes = module.default.routes
                    traverse(routes);
                }, 3000)
            }
        })

}

export function bootstrap(options) {
    appManager.mode = options.mode || "production"
    appManager.library = options.library || "library"
    appManager.shadowDom = options.shadowDom || false
    appManager.preFetch = options.preFetch || false
    appManager.history = options.history || false;

    if (appManager.mode === "development") {
        console.log(`plugins loaded: ${Object.values(plugins).map(plugin => plugin.name)}`)
    }

    if (appManager.history) {
        window.addEventListener("click", (event) => {
            let aElement = event.path.find((element) => element.localName === "a" && element.hasAttribute("href"));
            if (aElement) {
                event.stopPropagation();
                event.preventDefault();
                let url = aElement.getAttribute("href");
                history.pushState(null, null, url)
                window.dispatchEvent(new Event("popstate"));
                return false;
            }
            return true;
        })
    }

    mountApp(options.app)
}

