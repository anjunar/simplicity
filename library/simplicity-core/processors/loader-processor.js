import {appManager} from "../manager/app-manager.js";

export function loader(url) {
    let result;
    let request = new XMLHttpRequest();
    request.open("GET", url, false)
    request.addEventListener("loadend", (event) => {
        result = event.target.responseText
    })
    request.send()
    return result;
}

export function libraryLoader(url) {
    let result;
    let request = new XMLHttpRequest();
    request.open("GET", appManager.library + "/" + url, false)
    request.addEventListener("loadend", (event) => {
        result = event.target.responseText
    })
    request.send()
    return result;
}