import {appManager} from "./manager/app-manager.js";

export function mountApp(appPath) {

    import("../../" + appPath)
        .then((module) => {
            document.body.appendChild(new module.default())
        })

}

export function bootstrap(options) {
    appManager.mode = options.mode
}

