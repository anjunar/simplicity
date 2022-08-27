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

export function mountApp(options) {

    import("../../" + options.app)
        .then((module) => {
            let app = new module.default();

            let language = navigator.language.split("-")[0]
            if (language === "en" || language === "de") {
                // No Op
            } else {
                language = "en"
            }

            app.app = app;
            app.language = language;

            document.body.appendChild(app)

            if (appManager.preFetch) {
                window.setTimeout(() => {
                    let routes = module.default.routes
                    traverse(routes);
                }, 3000)
            }

            function startWith(routes, url) {
                for (const route of routes) {
                    if (url.startsWith(route)) {
                        return true;
                    }
                }
                return false;
            }

            if (options.history) {
                window.addEventListener("click", (event) => {
                    let aElement;
                    if (event.composedPath) {
                        aElement = event.composedPath().find((element) => element.localName === "a" && element.hasAttribute("href"));
                    } else {
                        aElement = event.path.find((element) => element.localName === "a" && element.hasAttribute("href"));
                    }

                    if (aElement) {
                        let url = aElement.getAttribute("href");
                        let routes = app.constructor.routes;
                        let strings = Object.keys(routes.children);
                        if (startWith(strings, url)) {
                            event.stopPropagation();
                            event.preventDefault();
                            history.pushState(null, null, url)
                            window.dispatchEvent(new Event("popstate"));
                            return false;
                        }
                    }
                    return true;
                })
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

    mountApp(options)
}

