const path = require('path')
const fs = require('fs')

//Solidity Compiler
const solc = require('solc')

//Reading contract file
const contractPath = path.resolve(__dirname,'contracts','StateChannel.sol')
const source = fs.readFileSync(contractPath,'utf8')

// console.log(solc.compile(source,2))
//Compiling code
module.exports = solc.compile(source,1).contracts[':StateChannel']