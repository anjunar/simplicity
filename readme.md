# [Simplicity Framework](https://anjunar.github.io/simplicity)

This is a UI Framework like AngularJS, ReactJS or Vue. It is kept simple and easy to use.
It has no virtual Dom or Compiler, everything is done almost natively. The burden of build 
management is not needed because ES6 Modules are used together with Web Components. It has
great performance and readability.

index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Simplicity</title>
    <link rel="stylesheet" href="styles.css">
    <script type="module" src="documentation/app.js"></script>
</head>
<body>
    <app-documentation></app-documentation>
</body>
</html>
```

app.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App</title>
</head>
<body>
    <template>
        <div>${text}</div>
    </template>
</body>
</html>
```

app.js
```javascript
import {customComponents} from "../library/simplicity/simplicity.js";
import {loader} from "../library/simplicity/processors/loader-processor.js";

export default class DocumentationApp extends HTMLElement {

    text = "Hello World!"

    static get template() {
        return loader("documentation/app.html");
    }
}

customComponents.define("app-documentation", DocumentationApp);

```