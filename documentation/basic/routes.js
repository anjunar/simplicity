import {routes as architecture} from "./architecture/routes.js";
import {routes as control} from "./control/routes.js";
import {routes as internals} from "./internals/routes.js";

export const routes = {
    "started" : {
        file : "documentation/basic/started.js"
    },
    "architecture" : {
        children : architecture
    },
    "control" : {
        children : control
    },
    "internals" : {
        children : internals
    }
}