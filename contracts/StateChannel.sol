pragma solidity 0.4.24;

contract StateChannel {
    
    mapping (bytes32 => address) signature;
    mapping (address => bytes32) keys; 
    
    struct Channel {
        address channelSender;
        address channelReceiver;
        uint deposit;
    }
    
    Channel public newchannel;
    
    function createChannel(address receiver_key, uint deposit) public payable {
        
        require(msg.value == deposit);
        
        newchannel.channelSender = msg.sender;
        newchannel.channelReceiver = receiver_key;
        newchannel.deposit = deposit;
       
    }

    function closeChannel(bytes32 h,uint8 v,bytes32 r,bytes32 s,string val) public returns(string){
        
        address signer;
        bytes32 proof;

        //Checking signer creating channel
        signer = recoverAddr(h,v,r,s);
        if(signer != newchannel.channelSender && signer != newchannel.channelReceiver){
            return "Signer not authenticated to channel, Request cancel";
        }
        proof = keccak256(val);
        
        if(proof != h) return "Data not send by corresponding recipient";
        
        if(signature[proof] == 0){
            //First Signer
            if(signer == newchannel.channelSender || signer == newchannel.channelReceiver)
                signature[proof] = signer;
            else
                revert();
            
            return "Agreement from another recipient needed";
        }else{
            //Both Signer Provided
            if(signer == newchannel.channelReceiver || signer == newchannel.channelSender){
                // delete newchannel;
                return "Account Settled";
            }
        }
    }

    function settleAccount(address user) public payable {
        user.transfer(this.balance - msg.value);
    }

    function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, msgHash);
        return ecrecover(prefixedHash, v, r, s);
    }
    
    function isSigned(address _addr, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) public pure returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, msgHash);
        return ecrecover(prefixedHash, v, r, s) == _addr;
    }
    
}

