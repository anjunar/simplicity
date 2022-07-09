import {routes as view} from "./view/routes.js";

export const routes = {
    "component": {
        file: "documentation/basic/architecture/component.js"
    },
    "overview": {
        file: "documentation/basic/architecture/overview.js"
    },
    "view": {
        file: "documentation/basic/architecture/view.js",
        children : view
    }
}
