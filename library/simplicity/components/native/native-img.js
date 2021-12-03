import {customComponents} from "../../simplicity.js";

class NativeImg extends HTMLImageElement  {}

export default customComponents.define("native-img", NativeImg, {extends : "img"})