import {appManager} from "../manager/app-manager.js";
import {compile} from "../interpreters/html-interpreter.js";
import {parse} from "../interpreters/css-interpreter.js";

const domParser = new DOMParser();

export function loader(url) {
    let request = new XMLHttpRequest();
    let newUrl = "./" + url;
    request.open("GET", newUrl, false)
    request.send(null)
    let response = request.response;
    let document = domParser.parseFromString(response, "text/html");
    let template = document.querySelector("template");
    let result = {
        html : compile(template)
    };
    let styleElement = document.querySelector("style");
    if (styleElement) {
        result.css = parse(styleElement)
    }
    let i18nElement = document.querySelector("i18n");
    if (i18nElement) {
        let messages = [];
        for (const translationElement of i18nElement.children) {
            let message = {};
            messages.push(message);
            for (const languageElement of translationElement.children) {
                message[languageElement.localName] = languageElement.innerHTML.trim();
            }
        }
        result.i18n = messages;
    }
    return result;
}

export function libraryLoader(url) {
    let request = new XMLHttpRequest();
    let newUrl = "./" + appManager.library + "/" + url;
    request.open("GET", newUrl, false)
    request.send(null)
    let response = request.response;
    let document = domParser.parseFromString(response, "text/html");
    let template = document.querySelector("template");
    let result = {
        html : compile(template)
    };
    let styleElement = document.querySelector("style");
    if (styleElement) {
        result.css = parse(styleElement)
    }
    let i18nElement = document.querySelector("i18n");
    if (i18nElement) {
        let messages = [];
        for (const translationElement of i18nElement.children) {
            let message = {};
            messages.push(message);
            for (const languageElement of translationElement.children) {
                message[languageElement.localName] = languageElement.innerHTML.trim();
            }
        }
        result.i18n = messages;
    }
    return result;
}