function onDatabaseLoaded(appPath) {

    import("../../" + appPath)
        .then((module) => {
            document.body.appendChild(new module.default())
        })

}

export function bootstrap(appPath) {
    const request = indexedDB.open("simplicity", 1);

    request.onupgradeneeded = function () {
        window.db = request.result;
        window.db.createObjectStore("table", {keyPath: "id"});
        onDatabaseLoaded(appPath);
    };

    request.onsuccess = function () {
        window.db = request.result;
        onDatabaseLoaded(appPath);
    };
}

/*
        let browserName = "";

        if(navigator.vendor.match(/google/i)) {
            browserName = 'chrome/blink';
        }
        else if(navigator.vendor.match(/apple/i)) {
            browserName = 'safari/webkit';
        }
        else if(navigator.userAgent.match(/firefox\//i)) {
            browserName = 'firefox/gecko';
        }
        else if(navigator.userAgent.match(/edge\//i)) {
            browserName = 'edge/edgehtml';
        }
        else if(navigator.userAgent.match(/trident\//i)) {
            browserName = 'ie/trident';
        }
        else
        {
            browserName = navigator.userAgent + "\n" + navigator.vendor;
        }
        alert(browserName);
*/
