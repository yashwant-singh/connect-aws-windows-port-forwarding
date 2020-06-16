#!/usr/bin/env node
const AWS = require('aws-sdk');
const prompt = require('prompt-sync')();
const ttd = require("./ttd")
const ibp100 = require("./ibp-100")

const argv = require('yargs').options({
    'a': {
      alias: ('a','aws'),
      default: 'ibp',
      describe: 'AWS account ttd(DesktopTools) or ibp(ibp-100 prod)',
      demandOption: "a"
    },
    'i': {
      alias: ('i', 'instance'),
      describe: 'Provide AWS Instance Id',
      demandOption: "i"
    },
    't': {
      alias: ('t', 'token'),
      default: 0,
      describe: 'Generate token before connecting to aws 1 - For Yes, 0 - For No',
      demandOption: "i"
    }
  })
  .help()
  .argv
// console.log(argv)
console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::::")
let account = argv.a
if (!account) {
    account = prompt(':::For TTD Press 1::::For IBP-100 Press 2::\n')
}


if(account && account == 'ttd') {
    console.log("Connecting TTD AWS")
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'ttd-rsa'})
    // ttd.main()
    if(argv.t == 1) {
        ttd.getAWSToken()
    }
    ttd.printInstancePassword(argv.i)
    ttd.getInstanceDetails(argv.i)
} else if ( account == 'ibp') {
    console.log("Connecting IBP-100 AWS")
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'id_rsa_olympus'})
    // ibp100.main()
    if(argv.t == 1) {
        ibp100.getAWSToken()
    }
    ibp100.printInstancePassword(argv.i)
    ibp100.getInstanceDetails(argv.i)
} else {
    console.log("You have not enter correct account details!")
}
