import { flatten } from "./flattener";

describe("Flattener", () => {
    it("flattens a simple file correctly", () => {
        const tree = { "table.colortable td": ["text-align:center", "text-transform:uppercase"] }
        expect(flatten(tree)).toEqual("table.colortable td { text-align:center;text-transform:uppercase }")
    })

    it("flattens a slighlty more complex file correctly", () => {
        const tree = {
            "table.colortable td": ["text-align:center"],
            "table.colortable th": [
                "text-align:center",
                "background:black",
                "color:white",
            ]
        }
        expect(flatten(tree)).toEqual("table.colortable td { text-align:center } table.colortable th { text-align:center;background:black;color:white }")
    })

    it("flattens a nested file correctly", () => {
        const tree = {
            "table.colortable": [
                "text-align:center",
                {
                    "& th": ["text-align:center"],
                }
            ]
        };
        expect(flatten(tree)).toEqual("table.colortable { text-align:center } table.colortable th { text-align:center }")
    })

    it("flattens mumumumultielements correctly", () => {
        const tree = {
            "table.colortable, table.striped": [
                "text-align:center",
                {
                    "& th": [
                        "text-align:center",
                        {
                            "& p": [
                                "margin: 0"
                            ]
                        }
                    ],
                }
            ]
        };
        expect(flatten(tree)).toEqual("table.colortable, table.striped { text-align:center } "
            + ":is(table.colortable, table.striped) th { text-align:center } "
            + ":is(table.colortable, table.striped) th p { margin: 0 }")
    })

    it("flattens a complex file correctly", () => {
        const tree = {
            "table.colortable": [
                {
                    "& td": [
                        "text-align:center",
                        {
                            "&.c": ["text-transform:uppercase"],
                        }, {
                            "&:first-child, &:first-child + td": ["border:1px solid black"]
                        }
                    ]
                }]
        };
        expect(flatten(tree)).toEqual("table.colortable {  } table.colortable td { text-align:center } table.colortable td.c { text-transform:uppercase } table.colortable td:first-child, table.colortable td:first-child + td { border:1px solid black }")
    })

    it("can handle different at-rules", () => {
        const tree = {
            "@font-face": [
                'font-family: "Open Sans"',
                'src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),\n' +
                '             url("/fonts/OpenSans-Regular-webfont.woff") format("woff")'
            ],
            "@keyframes jump":
                [{ "0%": ["top: 0"] }, { "50%": ["top: 10px"] }, { "100%": ["top: 0"], }],
            "table.colortable td": ["text-align:center"]
        }
        expect(flatten(tree)).toEqual('@font-face { font-family: "Open Sans";src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),\n'+
        '             url("/fonts/OpenSans-Regular-webfont.woff") format("woff") } ' +
        "@keyframes jump { 0% { top: 0 } 50% { top: 10px } 100% { top: 0 } }" + 
        "table.colortable td { text-align:center }")
    })

    it("can handle the @nest rule", () => {
        const tree = ({
            "table.colortable": [
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
        expect(flatten(tree)).toEqual("table.colortable {  } " +
        "table.colortable th { text-align:center;background:black;color:white } " +
        ".dark table.colortable { color: white;background: black } " +
        ".dark table.colortable th { color: black;background: white }")
    })

    it("Flattens nested media queries correctly", () => {
        const tree = {
            "table.colortable": [
                {
                    "& td": [
                        "text-align:left"
                    ],
                }, {
                    "@media screen and (min-width: 900px)":[
                    {
                        "& td": [
                            "text-align:center"
                        ]
                    }]
                }
            ],
            "@media screen and (min-width: 900px)":[
                {
                    "html, body": [
                        "margin: 0"
                    ]
                }
            ]
        }
        expect(flatten(tree)).toEqual("table.colortable {  } "+
        "table.colortable td { text-align:left } " +
        "@media screen and (min-width: 900px) { table.colortable td { text-align:center } html, body { margin: 0 } }")
    })
})