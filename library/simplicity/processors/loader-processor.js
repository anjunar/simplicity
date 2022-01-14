let domParser = new DOMParser();

export function loader(url) {
    let result;
    let request = new XMLHttpRequest();
    request.open("GET", url, false)
    request.addEventListener("loadend", (event) => {
        result = domParser.parseFromString(event.target.responseText, "text/html");
    })
    request.send()
    return result;
}