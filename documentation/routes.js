import {routes as basic} from "./basic/routes.js";
import {routes as components} from "./components/routes.js";
import {routes as expert} from "./expert/routes.js";

export const routes = {
    children : {
        "home" : {
            file : "documentation/home/index.js"
        },
        "basic" : {
            file: "documentation/basic/index.js",
            children : basic
        },
        "components" : {
            file: "documentation/components/index.js",
            children: components
        },
        "expert" : {
            file : "documentation/expert/index.js",
            children : expert
        }
    }
}