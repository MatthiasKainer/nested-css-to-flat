import { parseNode } from "./parser"

describe("parser", () => {
    it("creates a flat tree of a string", () => {
        expect(parseNode("table.colortable td { text-align:center; }").node).toEqual({ "table.colortable td": ["text-align:center"] })
    })
    it("can handle short at-rules", () => {
        expect(parseNode("@charset \"utf-8\"; table.colortable td { text-align:center; }").node).toEqual({ "@charset \"utf-8\"": undefined, "table.colortable td": ["text-align:center"] })
    })

    it("can handle complex at-rules", () => {
        /*  */
        const { node } = parseNode(`
        @keyframes jump {
            0% { top: 0; }
            50% { top: 10px; }
            100% { top: 0; }
          }
        
      @font-face {
        font-family: "Open Sans";
        src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
             url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
      } table.colortable td { text-align:center; }`)
        expect(node).toEqual({
            "@font-face": [
                'font-family: "Open Sans"',
                'src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),\n' +
                '             url("/fonts/OpenSans-Regular-webfont.woff") format("woff")'
            ],
            "@keyframes jump":
                [{ "0%": ["top: 0"] }, { "50%": ["top: 10px"] }, { "100%": ["top: 0"], }],
            "table.colortable td": ["text-align:center"]
        })
    })

    it("creates an array of elements if there are multiple root elements", () => {
        const { node } = parseNode(`table.colortable td {
        text-align:center;
      }
      table.colortable th {
        text-align:center;
        background:black;
        color:white;
      }`)
        expect(node).toEqual({
            "table.colortable td": ["text-align:center"],
            "table.colortable th": [
                "text-align:center",
                "background:black",
                "color:white",
            ]
        })
    })

    it("works for duplicate keys", () => {
        const { node } = parseNode(`table.colortable {
        text-align:center;
      }
      table.colortable {
        text-align:center;
        background:black;
        color:white;
      }`)
        expect(node).toEqual({
            "table.colortable": [
                "text-align:center",
                "text-align:center",
                "background:black",
                "color:white",
            ]
        })
    })

    it("supports @nest rules", () => {
        const { node } = parseNode(`table.colortable {
            & td {
              text-align:center;
              &.c { text-transform:uppercase }
              &:first-child, &:first-child + td { border:1px solid black; }
            }
    
            & th {
                text-align:center;
                background:black;
                color:white;
              }
            
            @nest .dark & {
                color: white;
                background: black;
                & th {
                    color: black;
                    background: white;
                }
            }
        }`)
        expect(node).toEqual({
            "table.colortable": [
                {
                    "& td": [
                        "text-align:center",
                        {
                            "&.c": [
                                "text-transform:uppercase"
                            ]
                        },
                        {
                            "&:first-child, &:first-child + td": [
                                "border:1px solid black"
                            ]
                        }
                    ]
                },
                {
                    "& th": [
                        "text-align:center",
                        "background:black",
                        "color:white"
                    ]
                },
                {
                    "@nest .dark &": [
                        "color: white",
                        "background: black",
                        {
                            "& th": [
                                "color: black",
                                "background: white"
                            ]
                        }
                    ]
                }
            ]
        })
    })

    it("handles top-level queries correctly", () => {
        const { node } = parseNode(`
        td {
            text-align:left;
        }
        @media screen and (min-width: 900px) {
            td {
                text-align:center;
            }
        }`)
        expect(node).toEqual({
            td: ['text-align:left'],
            "@media screen and (min-width: 900px)": [
                {
                    "td": [
                        "text-align:center"
                    ]
                }
            ]
        })
    })

    it("adds queries correctly", () => {
        const { node } = parseNode(`table.colortable {
        & td {
            text-align:left;
        }
        @media screen and (min-width: 900px) {
            & td {
                text-align:center;
            }
        }
    }
    @media screen and (min-width: 100px) {
        body {
            text-align:center;
        }
    }`)
        expect(node).toEqual({
            "table.colortable": [
                {
                    "& td": [
                        "text-align:left"
                    ],
                }, {
                    "@media screen and (min-width: 900px)": [
                        {
                            "& td": [
                                "text-align:center"
                            ]
                        }
                    ]
                }
            ],
            "@media screen and (min-width: 100px)": [
                {
                    "body": [
                        "text-align:center"
                    ]
                }
            ]
        })
    })

    it("creates an array of elements if there are nested and multiple", () => {
        const { node } = parseNode(`table.colortable {
        & td {
          text-align:center;
          &.c { text-transform:uppercase }
        }
        text-align:center;
    }`)
        expect(node).toEqual({
            "table.colortable": [
                {
                    "& td": [
                        "text-align:center",
                        {
                            "&.c": ["text-transform:uppercase"]
                        }
                    ]
                },
                "text-align:center"
            ]
        })
    })

    it("creates an array of elements if there are multiple different children", () => {
        const { node } = parseNode(`table.colortable {
        & td {
          text-align:center;
          &.c { text-transform:uppercase }
          &:first-child, &:first-child + td { border:1px solid black; }
        }

        & th {
            text-align:center;
            background:black;
            color:white;
          }
        `)
        expect(node).toEqual({
            "table.colortable": [
                {
                    "& td": [
                        "text-align:center",
                        {
                            "&.c": ["text-transform:uppercase"],
                        }, {
                            "&:first-child, &:first-child + td": ["border:1px solid black"]
                        }
                    ],
                }, {
                    "& th": [
                        "text-align:center",
                        "background:black",
                        "color:white",
                    ]
                }
            ]
        })
    })
})