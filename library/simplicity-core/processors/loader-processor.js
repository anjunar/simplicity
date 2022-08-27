import {appManager} from "../manager/app-manager.js";

export function loader(url) {
    let request = new XMLHttpRequest();
    let newUrl = "./" + url;
    request.open("GET", newUrl, false)
    request.send(null)
    return request.response;
}

export function libraryLoader(url) {
    let request = new XMLHttpRequest();
    let newUrl = "./" + appManager.library + "/" + url;
    request.open("GET", newUrl, false)
    request.send(null)
    return request.response
}