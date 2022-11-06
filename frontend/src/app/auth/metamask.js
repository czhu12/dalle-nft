const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyPolygonKey = process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_KEY;
const alchemyRinkebyKey = process.env.NEXT_PUBLIC_ALCHEMY_RINKEBY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      return { address: addressArray[0], success: true };
    } catch (err) {
      return {
        address: "",
        success: false,
      };
    }
  } else {
    return {
      address: "",
      success: false,
      reason: "INSTALL_METAMASK",
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          success: true,
        };
      } else {
        return {
          address: "",
          success: false,
        };
      }
    } catch (err) {
      return {
        address: "",
        success: false,
      };
    }
  } else {
    return {
      address: "",
      success: false,
      reason: "INSTALL_METAMASK",
    };
  }
};

export const checkContractDeploymentStatus = async (chain, transactionHash) => {
  const web3 = createProvider(chain);
  const receipt = await web3.eth.getTransactionReceipt(transactionHash);
  return receipt;
}
export const createProvider = (chain) => {
  let web3;
  if (chain === 'rinkeby') {
    web3 = createAlchemyWeb3(alchemyRinkebyKey);
  } else if (chain === 'polygon') {
    web3 = createAlchemyWeb3(alchemyPolygonKey);
  } else {
    web3 = createAlchemyWeb3(alchemyKey);
  }
  return web3
}
export const handleSignMessage = ({ publicAddress, nonce, chain }) => {
  let web3 = createProvider(chain);
  return new Promise((resolve, reject) =>
    web3.eth.personal.sign(
      web3.utils.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
      publicAddress,
      (err, signature) => {
        if (err) return reject(err);
        return resolve({ publicAddress, signature });
      }
    )
  );
};

export const handleSignMessageWithNonce = ({ publicAddress, _nonce, chain }) => {
  let web3 = createProvider(chain);
  const nonce = `Sign in to view secret content!  nonce: ${_nonce}`
  return new Promise((resolve, reject) =>
    web3.eth.personal.sign(
      web3.utils.fromUtf8(nonce),
      publicAddress,
      (err, signature) => {
        if (err) return reject(err);
        return resolve({ publicAddress, signature, nonce });
      }
    )
  );
};

export async function getBalance(chain, wallet) {
  let web3 = createProvider(chain);
  const amount = await web3.eth.getBalance(wallet);
  return amount
}

export async function addPolygonNetwork() {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainName: 'Polygon Mainnet',
        chainId: web3.utils.toHex(137),
        nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
        rpcUrls: ['https://polygon-rpc.com/']
      }
    ]
  });

}

export function PleaseInstallMetamask() {
  return <div>
    Please Install <a href="https://metamask.io/">Metamask</a>
  </div>
}

export function metamaskInstalled() {
  return typeof window.ethereum !== 'undefined';
}

export async function connectToChain(chain) {
  let targetNetworkId;
  if (chain === 'rinkeby') {
    targetNetworkId = '0x5';
  } else if (chain === 'polygon') {
    targetNetworkId = '0x89';
  } else if (chain === 'eth') {
    targetNetworkId = '0x1';
  }
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: targetNetworkId }],
  });
}

export function connectMetamask(onAccountsChanged, onNetworkChanged) {
  if (!window.ethereum) {
    return;
  }
  window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    onAccountsChanged(accounts)
  })

  window.ethereum.on('networkChanged', function (networkId) {
    // Time to reload your interface with the new networkId
    onNetworkChanged(networkId)
  })
}

export const getSignatureForAddress = async (signer, chain, contractAddress, walletAddress) => {
  let web3;
  if (chain === 'polygon') {
    web3 = createAlchemyWeb3(alchemyPolygonKey);
  } else {
    web3 = createAlchemyWeb3(alchemyKey);
  }

  const data = JSON.stringify({
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      NFT: [{ name: "wallet", type: "address" }],
    },
    domain: {
      name: "Mintables",
      version: "1.0.0",
      chainId: parseInt(window.ethereum?.networkVersion, 10),
      verifyingContract: contractAddress,
    },
    primaryType: "NFT",
    message: { wallet: walletAddress }
  });

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      method: "eth_signTypedData_v3",
      params: [signer, data],
      from: signer
    }, (err, res) => {
      if (res) {
        resolve(res.result)
      }
      if (err) {
        reject(err)
      }
    });
  });
}