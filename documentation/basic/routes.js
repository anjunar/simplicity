import {routes as architecture} from "./getting-started/routes.js";
import {routes as control} from "./control/routes.js";
import {routes as internals} from "./internals/routes.js";

export const routes = {
    "getting-started" : {
        children : architecture
    },
    "control" : {
        children : control
    },
    "internals" : {
        children : internals
    }
}