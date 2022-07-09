import {routes as compiler} from "./compiler/routes.js";
import {routes as meta} from "./meta/routes.js";

export const routes = {
    "compiler" : {
        children : compiler
    },
    "meta" : {
        children : meta
    }
}