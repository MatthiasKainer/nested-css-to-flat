#!/usr/bin/env node
import readline from "readline"
import { transform } from "./src/index.js"

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let css = ""
rl.on('line', function (line) {
    css += line
}).on('close', () => {
    console.log(transform(css))
})