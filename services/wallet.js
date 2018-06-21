var Wallet = require('ethereumjs-wallet');
var EthUtil = require('ethereumjs-util');
var bodyParser = require('body-parser');
var web3 = require('./web3')
var pvt_key = [
    '08b89b8a34a03a43ce017d2c8dad8c54ffc40d655aef9270ff08450941b41b24',
    '3d8f969f4782aa1093be5ab8579f8d07ea736855e019ec2a9be23417a5b95406'
]
var i =0;

module.exports = {
    createWallet : async (req,res) => {
        console.log(req.body.password)
        var password = req.body.password

        await web3.eth.getAccounts()
            .then((accounts) => {   

                console.log("Account address: \n"+ accounts[i]);

                const privateKeyString = '0x' + pvt_key[i];
                const privateKeyBuffer = EthUtil.toBuffer(privateKeyString);

                const wallet = Wallet.fromPrivateKey(privateKeyBuffer);
                console.log("Private Key : " + wallet.getPrivateKeyString())
                console.log("Private Key : " + privateKeyString)
                
                var walletObj = {
                    private : wallet.getPrivateKeyString(),
                    address : accounts[i]
                }
                console.log(walletObj)
                req.session.wallet = walletObj

                res.render('wallet',{
                    wallet : req.session.wallet
                })
                
                i = 1;
            })
            .catch((err) => console.log(err))
    }
}

        // const privateKeyString = web3.utils.keccak256(password);
        // var account = await web3.eth.accounts.privateKeyToAccount(privateKeyString)
        // console.log(account)

                // const address = wallet.getAddressString();
                // // console.log("Wallet Address : " + address);
                // const keystoreFilename = wallet.getV3Filename();
                // // console.log(keystoreFilename);
                // const keystore = wallet.toV3(req.body.password);
                // // console.log("Keystore : \n" + keystore);

                                // var p = Promise.resolve(keystore)
                // p.then((value) => console.log(value))
        

        // const publicKey = wallet.getPublicKeyString();
        // console.log("Public Key : " + publicKey);

        
        