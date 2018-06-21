const web3 = require('./services/web3')
const ganache = require('ganache-cli')
// const HDWalletProvider = require('truffle-hdwallet-provider')
const {interface,bytecode} = require('./compile')

// const provider = new HDWalletProvider(
//     'skull mimic rice conduct pepper document erode chapter right bubble cloth autumn',
//     'https://rinkeby.infura.io/woh9YUv7tZ5ar5dtmgTV',
//     0,
//     2
// )
// const web3 = new Web3(ganache.provider())

// const estimate = async() => {
//     console.log(await web3.eth.estimateGas({data : bytecode}))
// }
// estimate()

//Fetching list of accounts
const deploy = async () => {
    const accounts = await web3.eth.getAccounts()
    console.log('Attempting to deploy from account[0]')
    // console.log(accounts)
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data : bytecode
        })
        .send({
            from : accounts[0],
            gas : '1000000'
        })
    console.log('Contract deploy to address: ' + result.options.address);
    console.log(interface)
}
deploy().then(() => console.log('Successfully deployed')).catch((err) => console.log(err))