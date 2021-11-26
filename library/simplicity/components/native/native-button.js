import {customComponents} from "../../simplicity.js";

class NativeButton extends HTMLButtonElement {}

export default customComponents.define("native-button", NativeButton, {extends : "button"})