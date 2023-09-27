import { ConnectButton, Button, useNotification } from "web3uikit";
import Link from "next/link";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import { useWeb3Contract, useMoralis, useChain } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";

export default function Header() {
  const [hasFunds, setHashFunds] = useState(true);
  const dispatch = useNotification();
  // console.log("CHAIN ID: " + we.eth.getChainId());

  // console.log(marketplaceAddress);
  const { account, Moralis, isWeb3Enabled } = useMoralis();
  // console.log("CHAIN ID: " + web3.eth.getChainId());
  let marketplaceAddress;
  const { chain, chainId } = useChain();

  if (chainId != null) {
    const readableChainId = parseInt(chainId, 16).toString();
    console.log("CHAIN ID: " + readableChainId);
    marketplaceAddress =
      networkMapping[chainId ? readableChainId : 11155111]["nftMarketplace"][0];
  }

  const handleWithdrawSucess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "funds gathered",
      title: "Funds transfered to your account",
      position: "topR",
    });
  };
  const { runContractFunction: withdrawFunds } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "withdrawProceeds",
    params: {},
  });
  const { runContractFunction: getFunds } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "getProceeds",
    params: { seller: account },
  });

  const getFundsAccount = async () => {
    let result = await getFunds({ onError: (err) => console.log(err) });
    if (result != null && result.toString() != "0") {
      setHashFunds(false);
    }
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getFundsAccount();
    }
  }, [account]);
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h1 className="py-4 px-4 font-bold text-3xl">NFT Marketplace</h1>
      <div className="flex flex-row items-center">
        <Link href="/" className="mr-4 p-6">
          HOME
        </Link>
        <Link href="/sellNft" className="mr-4 p-6">
          Sell NFT
        </Link>
        <Link href="/soldNft" className="mr-4 p-6">
          Sold NFT
        </Link>
        <Link href="/mintNft" className="mr-4 p-6">
          Mint NFT
        </Link>
        <Button
          text="Withdraw"
          theme="primary"
          onClick={() => {
            withdrawFunds({
              onError: (err) => alert(err.message),
              onSuccess: handleWithdrawSucess,
            });
          }}
          disabled={hasFunds}
        ></Button>

        <ConnectButton moralisAuth={true} />
      </div>
    </nav>
  );
}
