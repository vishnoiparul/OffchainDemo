var web3 = require('./web3')
const util = require('ethereumjs-util')
var bodyParser = require('body-parser');
var amqp = require('amqplib/callback_api')

//Contract requirinh
var statechannel = require('../contracts/statechannel')

var value = 0;
var promised_value = 0;
var channel;
var Message_queue = [];
var Encrypted_msg;
var public_A = '0x98fa7ec45a9431a2e593e312eeb88f42d85b12c7581780fdeeb2e7e49f80cc0fc155b5d7e0947af89b34c233e9068838e2359cbf53fac08ab0325cd15df6b747';
var public_B = '0x630059f03664bc7ce334bad6de4e2fc89f54c41898ede5b4f4587e439e5b1ea9cd97bf181d1402c9c63abeb40ab88d7f7f6724a01854ecf9607aa5b8a51e567f';

module.exports = {
    createChannel : async (req,res) => {

        //Fetching wallet and account parameter
        const pubKey = req.body.pub_key
        const deposit = req.body.deposite
        var wallet = req.session.wallet

        console.log("Wallet --------" + wallet.address)
        //create channel call from contract and storing in channel variable
        var amount = parseInt(web3.utils.toWei((deposit).toString(),"ether"))
        await statechannel.methods.createChannel(pubKey,amount).send({
            from : wallet.address,
            value : amount,
            gas : '3000000'
        });
        channel = await statechannel.methods.newchannel().call();
        console.log(channel)
        req.session.channel = channel
        req.session.deposit = deposit
        res.render('channel',{
            deposit : deposit,
            task : "send",
            message : null
        })

    },

    sendTask : async (req,res) => {
        var tweet = req.body.tweet
        var wallet = req.session.wallet

        //Sending Message       
        var cost = 0.2
        value = value + cost;
        promised_value = value
        if(value < req.session.deposit){
            var msgHash = web3.utils.keccak256(value.toString())
            //'A' sign using msgHash and private key of 'A' as (msgHash,prvt)
            const signer = await web3.eth.sign(msgHash,wallet.address)
            const { v, r, s} = await util.fromRpcSig(signer)
            var message = {
                v : v,
                r : r,
                s : s,
                msgHash : msgHash,
                value : value
            }

            console.log(wallet.address)

            Encrypted_msg = message
            Message_queue.push(tweet)
            res.render('channel',{
                deposit : req.session.deposit,
                task : "send",
                message : 'null'
            })

        }else{
            res.render('channel',{
                deposit : req.session.deposit,
                task : "send",
                message : "Channel limit reached, you can't send any more tweet."
            })
        }
        
    },
    receiveTask : async (req,res) => {
        var account = req.session.account
        console.log(Encrypted_msg)
       
       if(Message_queue.length != 0){
            //Verifying message
            var correctHash = web3.utils.keccak256(promised_value.toString())
            if(correctHash == Encrypted_msg.msgHash){
                //check if signer is 'A'
                //Calling isSigned() from contract ()
                var check = await statechannel.methods.recoverAddr(
                    Encrypted_msg.msgHash,
                    Encrypted_msg.v,
                    util.bufferToHex(Encrypted_msg.r),
                    util.bufferToHex(Encrypted_msg.s)
                ).call()
                console.log(check)
            }
            if(value = req.session.deposit){
                res.render('channel',{
                    deposit : null,
                    task : "receiver",
                    queue : Message_queue,
                    message : "Channel limit reached, please commit the channel."
                })
            }else{
                res.render('channel',{
                    deposit : null,
                    task : "receiver",
                    queue : Message_queue,
                    message : null
                })
            }
            
        }else{ 
            res.render('channel',{
                deposit : null,
                task : "receiver",
                queue : Message_queue,
                message : 'No received msg'
            })
        }
    },
    requestClosure : async (req,res) => {
        var msgHash = web3.utils.keccak256(value.toString())
         //'A' sign using msgHash and private key of 'B' as (msgHash,prvt)
        var wallet = req.session.wallet
        const signer = await web3.eth.sign(msgHash,wallet.address)
        const { v, r, s} = await util.fromRpcSig(signer)
        //Request closing channel
        //Sending confirmation using A's keys in contract function
        var str1 = await statechannel.methods.closeChannel(
            Encrypted_msg.msgHash,
            Encrypted_msg.v,
            util.bufferToHex(Encrypted_msg.r),
            util.bufferToHex(Encrypted_msg.s),
            Encrypted_msg.value.toString()
        ).call()
        console.log(str1)
        var sender = await statechannel.methods.recoverAddr(
            Encrypted_msg.msgHash,
            Encrypted_msg.v,
            util.bufferToHex(Encrypted_msg.r),
            util.bufferToHex(Encrypted_msg.s)
        ).call()
        console.log("Sender Address ---------------- " + sender)
        //Sending confirmation using B's keys in contract function
        var str2 = await statechannel.methods.closeChannel(
            msgHash,
            v,
            util.bufferToHex(r),
            util.bufferToHex(s),
            value.toString()
        ).call()
        console.log(str2)
        if(str1 == str2){
            //Committing changes to blockchain
            value = parseInt(web3.utils.toWei((value).toString(),"ether"))
            console.log('Balance before Settlement')
            console.log(await web3.eth.getBalance(statechannel.options.address))
            console.log(await web3.eth.getBalance(sender))
            console.log(await web3.eth.getBalance(wallet.address))
            await statechannel.methods.settleAccount(wallet.address).send({
                from : sender,
                value : (channel.deposit - value),
                gas : '1000000'
            })
            await statechannel.methods.settleAccount(sender).send({
                from : wallet.address,
                value : value,
                gas : '1000000'
            })
            console.log('Balance after Settlement')
            console.log(await web3.eth.getBalance(statechannel.options.address))
            console.log(await web3.eth.getBalance(sender))
            console.log(await web3.eth.getBalance(wallet.address))

        }

        
        //Channel is closed
        res.render('index')
    }
}