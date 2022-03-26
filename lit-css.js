import {css as litCss, unsafeCSS} from 'lit';
import {transform} from "./src/index.js"

function toString(string, ...tags) {  
    let str = string[0];
    for (let i = 0; i < tags.length; i++) {
      str += tags[i] + string[i + 1];
    }
    console.log(transform(str))
    return transform(str);
  }

export const css = (strings, ...values) => {
    return litCss`${unsafeCSS(toString(strings, ...values))}`;
}