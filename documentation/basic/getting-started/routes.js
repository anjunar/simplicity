import {routes as view} from "./view/routes.js";

export const routes = {
    "installation" : {
        file : "documentation/basic/getting-started/installation.js"
    },
    "component": {
        file: "documentation/basic/getting-started/component.js"
    },
    "view": {
        file: "documentation/basic/getting-started/view.js",
        children : view
    }
}
