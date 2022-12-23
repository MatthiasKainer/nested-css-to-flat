import { transform } from "../src"

describe("e2e", () => {

  it("transforms a nested table to a flat one", () => {
    expect(transform(`table.colortable, table.stripe {
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
      }`)).toMatchInlineSnapshot(`"table.colortable, table.stripe {  } :is(table.colortable, table.stripe) td { text-align:center } :is(table.colortable, table.stripe) td.c { text-transform:uppercase } :is(table.colortable, table.stripe) td:first-child, :is(table.colortable, table.stripe) td:first-child + td { border:1px solid black } :is(table.colortable, table.stripe) th { text-align:center;background:black;color:white }"`)
  })

  it("works nicely with a complete, realworldy css with many levels and queries", () => {
    expect(transform(`
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
      
      `)).toEqual("@charset \"utf-8\";@import url supports( supports-query ); "+
      '@font-face { font-family: "Open Sans";src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),\n             url("/fonts/OpenSans-Regular-webfont.woff") format("woff") }' +
      "html, body { margin: 0;padding: 0 } " + 
      "menu { background: black } menu ul { list-style:none }" +
      "table.colortable, table.stripe { color: black } " +
      ".dark-mode :is(table.colortable, table.stripe) { color: white;background: black } " + 
      ":is(table.colortable, table.stripe) td { text-align:center } " +
      ":is(table.colortable, table.stripe) td.c { text-transform:uppercase } " +
      ":is(table.colortable, table.stripe) td:first-child, :is(table.colortable, table.stripe) td:first-child + td { border:1px solid black } " +
      ":is(table.colortable, table.stripe) th { text-align:center;background:black;color:white }  "+ 
      "@keyframes jump { 0% { top: 0 } 50% { top: 30px;left: 20px } 50% { top: 10px } 100% { top: 0 } } " +
      "@media screen and (min-width: 900px) { " +
      ":is(table.colortable, table.stripe) td { font-size: larger } " +
      "body { font-size: larger } " +
      "}")
  })

  it.each([
    [
      `/* & can be used on its own */
    .foo {
      color: blue;
      width: 1oo%;
      & > .bar { color: red; }
    }`,
      `.foo { color: blue;width: 1oo% } .foo > .bar { color: red }`
    ],
    [
      `/* or in a compound selector,
      refining the parent’s selector */
    .foo {
      color: blue;
      &.bar { color: red; }
    }`,
      `.foo { color: blue } .foo.bar { color: red }`
    ],
    [
      `/* multiple selectors in the list must all
    start with & */
    .foo, .bar {
      color: blue;
      & + .baz, &.qux { color: red; }
    }`,
      `.foo, .bar { color: blue } :is(.foo, .bar) + .baz, :is(.foo, .bar).qux { color: red }`
    ],
    [
      `/* & can be used multiple times in a single selector */
    .foo {
      color: blue;
      & .bar & .baz & .qux { color: red; }
    }`,
      `.foo { color: blue } .foo .bar .foo .baz .foo .qux { color: red }`
    ],
    [
      `/* Somewhat silly, but can be used all on its own, as well. */
    .foo {
      color: blue;
      & { padding: 2ch; }
    }`,
      `.foo { color: blue } .foo { padding: 2ch }`
    ],
    [
      `/* Again, silly, but can even be doubled up. */
    .foo {
      color: blue;
      && { padding: 2ch; }
    }`,
      `.foo { color: blue } .foo.foo { padding: 2ch }`
    ],
    [
      `/* The parent selector can be arbitrarily complicated */
    .error, #404 {
      &:hover > .baz { color: red; }
    }`,
      `.error, #404 {  } :is(.error, #404):hover > .baz { color: red }`
    ],
    [
      `/* As can the nested selector */
    .foo {
      &:is(.bar, &.baz) { color: red; }
    }`,
      `.foo {  } .foo:is(.bar, .foo.baz) { color: red }`
    ],
    [
      `/* Multiple levels of nesting "stack up" the selectors */
    figure {
      margin: 0;
    
      & > figcaption {
        background: hsl(0 0% 0% / 50%);
    
        & > p {
          font-size: .9rem;
        }
      }
    }`,
      `figure { margin: 0 } figure > figcaption { background: hsl(0 0% 0% / 50%) } figure > figcaption > p { font-size: .9rem }`
    ]
  ]
  )("transforms %s to %s", (from, to) => {
    expect(transform(from)).toEqual(to)
  })

  it("Invalid selectors", () => {
    // Not supported in CSS, rather then 
    //  .foo__bar { color: red } 
    // it should return
    //  __bar.foo { color: red; }
    expect(transform(`.foo {
    color: blue;
    &__bar { color: red; }
  }`)).toMatchInlineSnapshot(`".foo { color: blue } .foo__bar { color: red }"`)
  })
})

describe("examples from https://webkit.org/blog/13607/help-choose-from-options-for-css-nesting-syntax/", () => {
  it.each([
    [
      `.foo {
        color: red;
        .bar {
          color: blue;
        }
        & p {
          color: yellow;
        }
      }`,
      `.foo { color: red } .foo .bar { color: blue } .foo p { color: yellow }`
    ],
    [
      `.foo {
        color: red;
        & .bar {
          color: blue;
        }
        & p {
          color: yellow;
        }
      }`,
      `.foo { color: red } .foo .bar { color: blue } .foo p { color: yellow }`
    ],
    [
      `a:hover {
        color: hotpink;
        :is(aside) & {
          color: red;
        }
      }`,
      `a:hover { color: hotpink } :is(aside) a:hover { color: red }`
    ],
    [
      `ol, ul {
        padding-left: 1em;
        @media (max-width: 30em){
          .type & {
            padding-left: 0;
          }
        }
      }`,
      // in the given example, it creates ".type ul, .type ol", however the :is is leading to the same result
      `ol, ul { padding-left: 1em } @media (max-width: 30em) { .type :is(ol, ul) { padding-left: 0 } }`
    ],
    [
      `:has(img) { 
        :is(a&) {
          border: none;
        }
      }`,
      // now keeping the :is works, but the result might be clearer if we clean that up
      `:has(img) {  } :is(a:has(img)) { border: none }`
    ]
  ]
  )("transforms %s to %s", (from, to) => {
    expect(transform(from)).toEqual(to)
  })
})