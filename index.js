#!/usr/bin/env node

const prompt = require('prompt-sync')();
const ttd = require("./ttd")
const ibp100 = require("./ibp-100")
console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::")
var account = prompt(':::For TTD Press 1::::For IBP-100 Press 2::\n')

if(account && account == 1) {
    ttd.main()
} else if ( account == 2) {
    ibp100.main()
} else {
    console.log("You have not enter correct account details!")
}
