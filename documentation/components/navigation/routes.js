import {routes as router} from "./router/routes.js";

export const routes = {
    "drawer" : {
        file : "documentation/components/navigation/drawer.js"
    },
    "router" : {
        file : "documentation/components/navigation/router.js",
        children : router
    },
    "tabs" : {
        file : "documentation/components/navigation/tabs.js"
    }
}