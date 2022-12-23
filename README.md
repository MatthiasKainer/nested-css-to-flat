# CSS Nesting Module - Reverse Polyfill
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Simple tranformation following the specs from [https://www.w3.org/TR/css-nesting-1/](https://www.w3.org/TR/css-nesting-1/).

It is not following Sass/LESS/similar Syntax, transformation from this languages will not lead to the expected results

## Playground

You can use this online without installing anything by opening [https://matthiaskainer.github.io/nested-css-to-flat/](https://matthiaskainer.github.io/nested-css-to-flat/)

## Usage

As cli

```bash
> echo ".example { color:red; & .of { color: green; & > .nested { background-color:red } } }" | npx nested-css-to-flat 
.example { color:red } .example .of { color: green } .example .of > .nested { background-color:red }
```

As module, install it in your package via `npm install nested-css-to-flat`

```js
import { transform } from "nested-css-to-flat"

const nestedCss =  `
/* Some comment */
.error, #404 {
    &:hover > .baz { color: red; }
}`;

const flatCss = transform(nestedCss)
```

With [lit](https://lit.dev)

```js
import {html} from "lit"
import {css} from "nested-css-to-flat/lit-css"
import {pureLit} from "pure-lit"

pureLit("my-element", () => html`
    <main>
        <p>Hello World!</p>
    </main>
    <footer> 
        <p>Copyright by me</p>
    </footer>
`, {
    styles: css`
    p {
        font-size: 1rem;
    }
    footer {
        background:black;
        & p {
            font-size: 0.75rem;
        }
    }
    `
})
```

## What it supports

A CSS

```css

@charset "utf-8";
@import url supports( supports-query );
@font-face {
    font-family: "Open Sans";
    src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
            url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
}
html, body {
    margin: 0; padding: 0;
}
menu {
    background: black;
    & ul { list-style:none; }
}
table.colortable, table.stripe {
    color: black;
    .dark-mode & {
        color: white;
        background: black; 
    }
    & td {
        text-align:center;
        &.c { text-transform:uppercase }
        &:first-child, &:first-child + td { border:1px solid black }
    }
    > th {
        text-align:center;
        background:black;
        color:white;
    }
    @media screen and (min-width: 900px) {
        & td {
            font-size: larger;
        }
    }
}
@keyframes jump {
    0% { top: 0; }
    50% { top: 30px; left: 20px; }
    50% { top: 10px; }
    100% { top: 0; }
}
@media screen and (min-width: 900px) {
    body {
        font-size: larger;
    }
}
```

becomes

```css
@charset utf-8;
@import url supports( supports-query);
@font-face {
	font-family: Open Sans;
	src: url(/fonts/OpenSans-Regular-webfont.woff2) format(woff2), url(/fonts/OpenSans-Regular-webfont.woff) format(woff)
}

html,
body {
	margin: 0;
	padding: 0
}

menu {
	background: black
}

menu ul {
	list-style: none
}

table.colortable,
table.stripe {
	color: black
}
.dark-mode :is(table.colortable, table.stripe) {
    color: white;
    background: black; 
}

 :is(table.colortable, table.stripe) td {
	text-align: center
}

 :is(table.colortable, table.stripe) td.c {
	text-transform: uppercase
}

 :is(table.colortable, table.stripe) td:first-child,
 :is(table.colortable, table.stripe) td:first-child+td {
	border: 1px solid black
}

 :is(table.colortable, table.stripe) > th {
	text-align: center;
	background: black;
	color: white
}

@keyframes jump {
	0% {
		top: 0
	}
	50% {
		top: 30px;
		left: 20px
	}
	50% {
		top: 10px
	}
	100% {
		top: 0
	}
}

@media screen and (min-width: 900px) {
	 :is(table.colortable, table.stripe) td {
		font-size: larger
	}
	body {
		font-size: larger
	}
}
```

## What it doesn't support

### No clean key generation

Currently, there is no token validation for keys. That means that 

```css
.foo {
  color: blue;
  &__bar { color: red; }
}
```

becomes

```css
.foo { color: blue; }
.foo__bar { color: red; }
```

whereas according to spec it should become, as `__bar` could be an html element 

```css
.foo { color: blue; }
__bar.foo { color: red; }
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://matthias-kainer.de/"><img src="https://avatars.githubusercontent.com/u/2781095?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matthias Kainer</b></sub></a><br /><a href="https://github.com/MatthiasKainer/nested-css-to-flat/commits?author=MatthiasKainer" title="Code">💻</a></td>
    <td align="center"><a href="https://www.youtube.com/c/eliutdev"><img src="https://avatars.githubusercontent.com/u/63687573?v=4?s=100" width="100px;" alt=""/><br /><sub><b>R. Eliut</b></sub></a><br /><a href="https://github.com/MatthiasKainer/nested-css-to-flat/commits?author=eliutdev" title="Tests">⚠️</a> <a href="https://github.com/MatthiasKainer/nested-css-to-flat/commits?author=eliutdev" title="Documentation">📖</a> <a href="#example-eliutdev" title="Examples">💡</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!