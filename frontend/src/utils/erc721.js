export class ERC721Contract {
  constructor(contractAddress, chain='eth') {
    this.contractAddress = contractAddress;
    this.web3 = createWeb3ForChain(chain);

    this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
    this.chain = chain;
    console.log(`Creating contract with address ${this.contractAddress}`)
  }


  async sendMethod(data, value=null) {
    if (currentChainName() !== this.chain) {
      throw new Error(`Please connect to the ${friendlyChainName(this.chain)} chain to mint.`);
    }
    const transactionParameters = {
      to: this.contractAddress, // Required except during contract publications.
      value: value,
      from: window.ethereum.selectedAddress, // must match user's active address.
      data: data.encodeABI(),
    };

    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return {
        success: true,
        transactionHash: txHash,
        status:
          "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" +
          txHash,
      };
    } catch (error) {
      return {
        success: false,
        status: "😥 Something went wrong: " + error.message,
      };
    }
  }

  async executeMint(amount, value, metadata=0) {
    const data = this.contract.methods.mint(amount, metadata);
    return await this.sendMethod(data, value);
  }
}

