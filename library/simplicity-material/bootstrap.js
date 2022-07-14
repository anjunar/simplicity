import {bootstrap as bootstrapCore} from "../simplicity-core/bootstrap.js";

export function bootstrap(options) {
    const request = indexedDB.open("simplicity", 1);

    request.onupgradeneeded = function () {
        window.db = request.result;
        window.db.createObjectStore("table", {keyPath: "id"});
        bootstrapCore(options);
    };

    request.onsuccess = function () {
        window.db = request.result;
        bootstrapCore(options);
    };
}