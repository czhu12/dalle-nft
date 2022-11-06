export const currentChainName = () => {
  const networkVersion = window.ethereum?.networkVersion
  if (networkVersion === '137') {
    return 'polygon';
  } else if (networkVersion === '5') {
    return 'rinkeby';
  } else if (networkVersion === '1') {
    return 'eth';
  }
}

export const friendlyWalletAddress = (address) => {
  if (!address) return;

  return `${address.substr(0, 5)}...${address.substr(address.length - 4, address.length)}`

}
export const friendlyCurrencyName = (chain) => {
  if (chain === 'polygon') {
    return 'MATIC';
  } else if (chain === 'rinkeby') {
    return 'ETH';
  } else if (chain === 'eth') {
    return 'ETH';
  }
}
export const friendlyChainName = (chain) => {
  if (chain === 'polygon') {
    return 'Polygon';
  } else if (chain === 'rinkeby') {
    return 'Goerli';
  } else if (chain === 'eth') {
    return 'Ethereum';
  }
}