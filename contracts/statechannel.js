var web3 = require('../services/web3.js')

const address = '0x34941d4101337dfFcC95d7529b1D5b7225Cc6970'

const contract = [{"constant":true,"inputs":[],"name":"newchannel","outputs":[{"name":"channelSender","type":"address"},{"name":"channelReceiver","type":"address"},{"name":"deposit","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"},{"name":"msgHash","type":"bytes32"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"isSigned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"receiver_key","type":"address"},{"name":"deposit","type":"uint256"}],"name":"createChannel","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"h","type":"bytes32"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"},{"name":"val","type":"string"}],"name":"closeChannel","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"msgHash","type":"bytes32"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"recoverAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"user","type":"address"}],"name":"settleAccount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]

module.exports = new web3.eth.Contract(contract, address);

