# CSS Nesting Module - Reverse Polyfill

Simple tranformation following the specs from [https://www.w3.org/TR/css-nesting-1/](https://www.w3.org/TR/css-nesting-1/).

It is not following Sass/LESS/similar Syntax, transformation from this languages will not lead to the expected results

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
    @nest .dark-mode & {
        color: white;
        background: black; 
    }
    & td {
        text-align:center;
        &.c { text-transform:uppercase }
        &:first-child, &:first-child + td { border:1px solid black }
    }
    & th {
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

 :is(table.colortable, table.stripe) th {
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
### Error handling: Garbage in - Garbage out

If you provide 

```css
/* No & at all! */
.foo {
  color: blue;
  .bar {
    color: red;
  }
}
```

it will return a broken css looking like this:

```css
.foo { color: blue;.bar {    color: red }
```

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
