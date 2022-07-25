import {routes as reactivity} from "./reactivity/routes.js";

export const routes = {
    "architecture": {
        file: "documentation/basic/internals/architecture.js"
    },
    "es6-modules" : {
        file : "documentation/basic/internals/es6-modules.js"
    },
    "membrane" : {
        file : "documentation/basic/internals/membrane.js"
    },
    "proxy" : {
        file : "documentation/basic/internals/proxy.js"
    },
    "reactivity" : {
        file : "documentation/basic/internals/reactivity.js",
        children : reactivity
    },
    "web-components" : {
        file : "documentation/basic/internals/web-components.js"
    }
}