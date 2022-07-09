import {routes as form} from "./form/routes.js";
import {routes as indicators} from "./indicators/routes.js";
import {routes as modals} from "./modals/routes.js";
import {routes as navigation} from "./navigation/routes.js";
import {routes as tables} from "./tables/routes.js";

export const routes = {
    "form" : {
        children : form
    },
    "indicators" : {
        children: indicators
    },
    "modals" : {
        children : modals
    },
    "navigation" : {
        children : navigation
    },
    "tables" : {
        children : tables
    }
}