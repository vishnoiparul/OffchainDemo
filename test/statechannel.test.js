const assert = require('assert')
const ganache = require('ganache-cli')
const util = require('ethereumjs-util');

const Web3 = require('web3')
const web3 = new Web3(ganache.provider())

//Requiring bytecode and Abi
const {interface, bytecode} = require('../compile')

let accounts
let statechannel

beforeEach(async () => {
    //Fetching list of ganache accounts
    accounts = await web3.eth.getAccounts()
    
    // console.log("ABI------------\n"+interface)

    //Using account[0] to deploy the contract
    statechannel = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data : bytecode
        })
        .send({
            from : accounts[0],
            gas : '1000000'
        })
})

describe('StateChannel Contract',() => {
    it('deploy a contract',() => {
        assert.ok(statechannel.options.address)
    })
    it('Creating channel',async () => {
        await statechannel.methods.createChannel(accounts[1],2).send({
            from : accounts[0],
            value : 2,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        // console.log(channel.channelSender +"\n"+ channel.channelReceiver +"\n"+ channel.deposit)
        assert.ok(channel)
    })
    it('Verify Sender',async () => {
        await statechannel.methods.createChannel(accounts[1],2).send({
            from : accounts[0],
            value : 2,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        assert.equal(channel.channelSender,accounts[0])
    })
    it('Verify Receiver',async () => {
        await statechannel.methods.createChannel(accounts[1],2).send({
            from : accounts[0],
            value : 2,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        assert.equal(channel.channelReceiver,accounts[1])
    })
    it('Get Channel Deposit',async () => {
        await statechannel.methods.createChannel(accounts[1],2).send({
            from : accounts[0],
            value : 2,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        console.log(channel.deposit)
        assert.ok(channel.deposit)
    })
    it('Recovering address',async () => {
        const value = 0.1;
        const data = web3.utils.sha3(value.toString())
        var sender = await web3.eth.sign(data,accounts[0]);
        const { v, r, s } = await util.fromRpcSig(sender);
        const recover_data = await statechannel.methods.recoverAddr(data,v,util.bufferToHex(r),util.bufferToHex(s)).call()
        assert.equal(recover_data,accounts[0])
    })
    it('Validating Signature',async () => {
        const value = 0.1;
        const data = await web3.utils.sha3(value.toString())
        var sender = await web3.eth.sign(data,accounts[0]);
        const { v, r, s } = await util.fromRpcSig(sender);
        var flag = await statechannel.methods.isSigned(accounts[0],data,v,util.bufferToHex(r),util.bufferToHex(s)).call()
        assert.equal(flag,true)
    })
    it('Verifying tasks',async () => {
        await statechannel.methods.createChannel(accounts[1],2).send({
            from : accounts[0],
            value : 2,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        var total = 0;
        //Sending Task 
        var value = 0.5
        var msgHash = web3.utils.sha3(value.toString())
        const signer = await web3.eth.sign(msgHash,accounts[0])
        const { v, r, s} = await util.fromRpcSig(signer)
        var A = {
            v : v,
            r : r,
            s : s,
            msgHash : msgHash
        }
        //Verifying Task
        var promised_value = 0.5;
        var correctHash = web3.utils.sha3(promised_value.toString())
        if(correctHash == msgHash){
            //check if signer is 'A'
            var flag = await statechannel.methods.isSigned(accounts[0],A.msgHash,A.v,util.bufferToHex(A.r),util.bufferToHex(A.s)).call()
            //if true, execute this
            if(flag){
                total += promised_value
            }else{
                assert(false)
            }
            assert.ok(total!=0)
        }
    })
    it('Closing channel',async () => {
        var amount = parseInt(web3.utils.toWei((2).toString(),"ether"))
        await statechannel.methods.createChannel(accounts[1],amount).send({
            from : accounts[0],
            value : amount,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        //Sending Task 
        var value = 0.5
        value = parseInt(web3.utils.toWei((0.5).toString(),"ether"))
        console.log('Value-----' + value)
        var msgHash = web3.utils.sha3(value.toString())
        const signer = await web3.eth.sign(msgHash,accounts[0])
        const { v, r, s} = await util.fromRpcSig(signer)
        var A = {
            v : v,
            r : r,
            s : s,
            msgHash : msgHash
        }
        //Verifying Task
        var promised_value = 0.5;
        promised_value = parseInt(web3.utils.toWei((0.5).toString(),"ether"))
        console.log('Promised Value-----' + promised_value)
        var correctHash = web3.utils.sha3(promised_value.toString())
        if(correctHash == msgHash){
            //check if signer is 'A'
            var flag = await statechannel.methods.isSigned(accounts[0],A.msgHash,A.v,util.bufferToHex(A.r),util.bufferToHex(A.s)).call()
            //if true, execute this
            if(flag){
                
            }else{
                console.log('Not matched')
            }
        }
        var totalHash = await web3.utils.sha3(value.toString())
        console.log("totalhash" + totalHash)
         //'B' sign using msgHash and private key of 'B' as (msgHash,prvt)
        const fsigner = await web3.eth.sign(totalHash,accounts[1])
        // { v, r, s} = await util.fromRpcSig(fsigner)
        var B = await util.fromRpcSig(fsigner)
        console.log(B)
        //Request closing channel
        //Sending confirmation using A's keys in contract function
        var str = await statechannel.methods.closeChannel(A.msgHash,A.v,util.bufferToHex(A.r),util.bufferToHex(A.s),value.toString()).call()
        console.log(str)
        //Sending confirmation using B's keys in contract function
        console.log("Check ----\n" + await statechannel.methods.recoverAddr(totalHash,B.v,util.bufferToHex(B.r),util.bufferToHex(B.s)).call())
        console.log(accounts[1])
        str = await statechannel.methods.closeChannel(totalHash,B.v,util.bufferToHex(B.r),util.bufferToHex(B.s),value.toString()).call()
        console.log(str)
        
        //Channel is closed,settling accounts
        assert.equal(str,"Account Settled")
    })
   it('Settling account',async () => {
        var amount = parseInt(web3.utils.toWei((2).toString(),"ether"))
        console.log("Amount----" + amount)
        await statechannel.methods.createChannel(accounts[1],amount).send({
            from : accounts[0],
            value : amount,
            gas : '1000000'
        });
        var channel = await statechannel.methods.newchannel().call();
        console.log(await web3.eth.getBalance(statechannel.options.address))
        
        var value = parseInt(web3.utils.toWei((0.5).toString(),"ether"))
        console.log('Balance before Settlement')
        console.log(await web3.eth.getBalance(statechannel.options.address))
        console.log(await web3.eth.getBalance(accounts[0]))
        console.log(await web3.eth.getBalance(accounts[1]))
        await statechannel.methods.settleAccount(accounts[1]).send({
            from : accounts[0],
            value : (channel.deposit - value),
            gas : '1000000'
        })
        await statechannel.methods.settleAccount(accounts[0]).send({
            from : accounts[1],
            value : value,
            gas : '1000000'
        })
        console.log('Balance after Settlement')
        console.log(await web3.eth.getBalance(statechannel.options.address))
        console.log(await web3.eth.getBalance(accounts[0]))
        console.log(await web3.eth.getBalance(accounts[1]))
    })
})