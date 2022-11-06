import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Image, InputGroup, Row } from "react-bootstrap";
import { connectToChain, connectMetamask, getBalance, metamaskInstalled, connectWallet, getCurrentWalletConnected } from "../../auth/metamask";
import { currentChainName, friendlyChainName, friendlyCurrencyName, friendlyWalletAddress } from "../../utils/blockchain";
import web3 from "web3";
import axios from "axios";
import DeploymentStatusCheck from "./DeploymentStatusCheck";
import { ContractFactory, ethers } from "ethers";
import ERC721Creator from "../../contract_definitions/ERC721Creator.json";
import { ERC721Contract } from "../../utils/erc721";
import { buildRoute } from "../../auth/client/routes";


const IMPLEMENTATION_ADDRESS = {
  polygon: "0x1dA3F95f80333293d8d38E3327bBA2C06103E243",
  rinkeby: "0x721b8B0A50FBc476451eC370B82d1Fa2Cee56530",
  eth: "0x3760415893F05e8009BF7D8f7817fdD94674a8F5",
}
const LOW_BALANCE_THRESHOLD = 0.02
export default function DeployContract({ generationPrompt, theme }) {
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [amountInWallet, setAmountInWallet] = useState(0);
  const [error, setError] = useState(null);
  const fetchWalletAmount = async () => {
    if (walletAddress && chain) {
      const amount = await getBalance(chain, walletAddress)
      console.log(chain, walletAddress, amount);
      setAmountInWallet(parseFloat(web3.utils.fromWei(amount, 'ether'), 10))
    }
  }

  const refreshWallet = async () => {
    const { address } = await getCurrentWalletConnected();
    setWalletAddress(address);
    setChain(currentChainName());
  }

  useEffect(() => {
    refreshWallet();
    connectMetamask(refreshWallet, refreshWallet);
    fetchWalletAmount();
  }, []);

  useEffect(() => {
    fetchWalletAmount();
  }, [walletAddress, chain])
  const click = async () => {
    setError(null);
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const factory = new ContractFactory(ERC721Creator["abi"], ERC721Creator["bytecode"], signer);

    try {
      const response = await axios.post(
        buildRoute("/ai_generation/bootstraps"),
        {
          generation_prompt_id: generationPrompt.id,
          chain: chain,
          owner_address: walletAddress,
        }
      );
      
      const contractDeployment = await factory.deploy(
        generationPrompt.prompt,
        "ART",
        response.data.base_uri,
        0,
        1000000,
        walletAddress,
        IMPLEMENTATION_ADDRESS[chain],
      );
      const contractAddress = contractDeployment.address;
      const deployedContract = new ERC721Contract(contractAddress, chain);
      await deployedContract.executeMint(1, 0, 0);
      if (chain === "polygon") {
        window.location.href = `https://opensea.io/assets/matic/${contractAddress}/0`
      } else {
        window.location.href = `https://opensea.io/assets/ethereum/${contractAddress}/0`
      }
      debugger;
    } catch(error) {
      console.error(error);
      setError(error);
    }
    setLoading(false);
  }

  return (
    <div className="top-bottom-nav text-center">
      <div>
        <div className="my-4">
          <Image className="main-image small-image" src={generationPrompt?.generation_image.source_url} />
        </div>
        <Row className="justify-content-center">
          <Col xs="auto">
            <img className="quote-image small-quote" src="/images/quotes-start.png" />
          </Col>
          <Col xs="auto">
            <div className="font-italic display-6">
              {generationPrompt.prompt}
            </div>
          </Col>
          <Col xs="auto">
            <img className="quote-image small-quote" src="/images/quotes-end.png" />
          </Col>
        </Row>
        <div>
          <div className="text-left mt-4">
            <div>
              What blockchain do you want your collection on?
              <Button
                className="mx-3"
                variant={chain === 'rinkeby' ? "light" : "outline-light"}
                onClick={async () => {
                  try {
                    await connectToChain('rinkeby');
                  } catch (exception) {
                    console.log(exception);
                  }
                }}>
                Goerli
              </Button>
              <Button
                className="mr-3"
                variant={chain === 'polygon' ? "light" : "outline-light"}
                onClick={async () => {
                  try {
                    await connectToChain('polygon');
                  } catch (exception) {
                    console.log(exception);
                  }
                }}>
                Polygon
              </Button>
              <Button
                className="mr-3"
                variant={chain === 'eth' ? "light" : "outline-light"}
                onClick={async () => {
                  try {
                    await connectToChain('eth');
                  } catch (exception) {
                    console.log(exception);
                  }
                }}>
                Ethereum
              </Button>
            </div>
            <div className="text-muted mt-3 mb-1">Blockchain Connection</div>
            <div>
              <DeploymentStatusCheck text={`Metamask Installed`} success={metamaskInstalled()} />
              <DeploymentStatusCheck text={`Wallet Connected`} success={!!walletAddress} />
              <div className="mx-4">
                {!walletAddress &&
                  <Alert className="mt-2" variant="danger">
                    <div>
                      Please connect metamask network.
                    </div>
                    <Button onClick={async () => {
                      await connectWallet()
                    }}>Connect Metamask</Button>
                  </Alert>
                }
              </div>
            </div>
            <div>
              <div className="text-muted mt-2 mb-1">Wallet Status</div>
              <DeploymentStatusCheck
                text={`Enough ${friendlyCurrencyName(chain)} in wallet to deploy contract`}
                success={amountInWallet > 0}
                warning={amountInWallet < LOW_BALANCE_THRESHOLD}
              />
              <div className="mx-4">
                <div className="mt-2">
                  {amountInWallet.toFixed(2)} {friendlyCurrencyName(chain)}
                </div>
                {amountInWallet === 0 && (
                  <Alert className="mt-2" variant="danger">
                    You do not have any <b>{friendlyCurrencyName(chain)}</b> in your wallet to deploy.
                    <br />
                    {chain === "rinkeby" && (
                      <div>
                        Get free Goerli tokens <a href="https://goerlifaucet.com/" target="_blank">here</a>
                      </div>
                    )}
                  </Alert>
                )}
                {amountInWallet > 0 && amountInWallet < LOW_BALANCE_THRESHOLD && (
                  <Alert className="mt-2" variant="warning">
                    You may not have enough <b>{friendlyCurrencyName(chain)}</b> in your wallet to deploy.
                  </Alert>
                )}
              </div>

            </div>
            {error && (
              <div className="text-danger">
                {error.code === "ACTION_REJECTED" && "Rejected Transaction"}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <Button
          disabled={loading}
          block
          onClick={click}
          className="my-4"
          size="lg"
          variant={theme}
        >
          {loading && "Deploying..."}
          {!loading && "Deploy Contract"}
        </Button>
        <a href="#" onClick={(e) => {
          e.preventDefault();
          setCurrentStep(1);
        }}>Go Back</a>
      </div>
    </div>
  );
};
