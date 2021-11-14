export function loader(url) {
    let result;
    let request = new XMLHttpRequest();
    request.open("GET", url, false)
    request.addEventListener("loadend", (event) => {
        result = event.target.responseText;
    })
    request.send()
    return result;
}