import {mountApp, bootstrap as bootstrapCore} from "../simplicity-core/bootstrap.js";

export function bootstrap(options) {
    bootstrapCore(options);

    const request = indexedDB.open("simplicity", 1);

    request.onupgradeneeded = function () {
        window.db = request.result;
        window.db.createObjectStore("table", {keyPath: "id"});
        mountApp(options.app);
    };

    request.onsuccess = function () {
        window.db = request.result;
        mountApp(options.app);
    };
}