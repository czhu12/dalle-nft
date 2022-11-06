import axios from 'axios';
import { currentChainName, friendlyChainName } from './blockchain';
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyPolygonKey = process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_KEY;
const alchemyRinkebyKey = process.env.NEXT_PUBLIC_ALCHEMY_RINKEBY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const contractABI = require("../contract_definitions/erc721.json");


export const createWeb3ForChain = (chain) => {
  if (chain === 'polygon') {
    return createAlchemyWeb3(alchemyPolygonKey);
  } else if (chain === 'rinkeby') {
    return createAlchemyWeb3(alchemyRinkebyKey);
  } else {
    return createAlchemyWeb3(alchemyKey);
  }
}
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

