import { useNotification } from "web3uikit";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import { useWeb3Contract } from "react-moralis";
import { useChain } from "react-moralis";
import networkMapping from "../../constants/networkMapping.json";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import { Bell } from "@web3uikit/icons";
import axios from "axios";

export default function mintNft() {
  const API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
  const { web3, isWeb3Enabled } = useMoralis();
  const [file, setFile] = useState(null);
  const [isPinning, setIsPinning] = useState("");
  const [getUrl, setUrl] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [txhash, setTxHash] = useState("0");
  const { chain, chainId } = useChain();
  let marketplaceAddress;
  if (chainId != null) {
    const readableChainId = parseInt(chainId, 16).toString();
    console.log("CHAIN ID: " + readableChainId);
    marketplaceAddress =
      networkMapping[chainId ? readableChainId : 11155111]["nftMarketplace"][0];
  }
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();

  // const { runContractFunction: createItem } = useWeb3Contract({
  //   abi: nftMarketplaceAbi,
  //   contractAddress: marketplaceAddress,
  //   functionName: "mintNft",
  //   params: { _tokenUri: getUrl },
  // });

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsPinning(true);

    const formData = new FormData(event.target);
    const formData2 = new FormData();
    formData2.append("file", file);
    const name = formData.get("name");
    const description = formData.get("description");
    if (name == "" || description == "" || file == null) {
      return alert("pls provide all data");
    }
    async function updateUi(tx) {
      setIsPinning(false);
    }
    const handleNewNotification = async function (tx) {
      dispatch({
        type: "info",
        message: `tx hash is  ${tx.hash}`,
        title: "Tx Notification",
        position: "topR",
        icon: <Bell></Bell>,
      });
    };
    const handleSuccess = async function (tx) {
      const txReciept = await tx.wait(1);
      const iface = new ethers.Interface(nftMarketplaceAbi);
      const parsedLogs = txReciept.logs.map((log) => {
        const parsedLog = iface.parseLog(log);
        return parsedLog;
      });
      console.log(parsedLogs);
      setTokenId(Number(parsedLogs[0].args[2]));
      console.log("TX", txReciept);
      console.log("TX");
      setTxHash(tx.hash);
      handleNewNotification(tx);
      updateUi(tx);
    };

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData2,
        {
          method: "post",
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );
      const fileurl = "ipfs://" + response.data.IpfsHash;
      console.log("fileurl", fileurl);
      // Generate metadata and save to IPFS
      const metadata = {
        name: name,
        description: description,
        image: fileurl,
      };
      console.log(metadata);
      const response2 = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          maxContentLength: "Infinity",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );
      const actualUri = "ipfs://" + response2.data.IpfsHash;
      setUrl(actualUri);
      const mintOption = {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "mintNft",
        gasLimit: 20000000000,
        params: {
          _tokenUri: actualUri,
        },
      };

      await runContractFunction({
        params: mintOption,
        onSuccess: async (tx) => {
          handleSuccess(tx);
        },

        onError: (e) => {
          console.log(e);
          setIsPinning(false);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className={styles.container}>
      {isWeb3Enabled ? (
        <div className="  flex justify-center mt-10  h-screen ">
          <form onSubmit={onSubmit}>
            <div>
              <label className="font-bold">
                Name:
                <br />
                <input
                  type="text"
                  name="name"
                  className="border border-green-500 rounded p-2 resize-none py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-green-500"
                />
              </label>
              <br />
              <br />
            </div>
            <label className="font-bold">
              description:
              <br />
              <input
                type="text"
                name="description"
                placeholder="Enter Your Description"
                className=" border border-green-500 rounded p-2 resize-none  text-gray-700 leading-tight focus:outline-none focus:ring focus:border-green-500"
                rows="4"
              />
            </label>
            <br />
            <input
              type="file"
              className="border-[1px] p-2 text-lg border-black"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*"
            />
            <br />
            <button
              type="submit"
              className=" text-center bg-green-300 text-white hover:bg-green-400 border-green-500 resize-none py-2 px-3 rounded-md w-272"
            >
              {isPinning ? (
                <div className="flex justify-center">
                  <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full "></div>
                </div>
              ) : (
                <div>Mint now!</div>
              )}
            </button>
            {tokenId ? (
              <div>
                Minted NFT TokenId :- {tokenId} <br /> ContractAddress:-
                {marketplaceAddress}
              </div>
            ) : (
              <div></div>
            )}
          </form>
        </div>
      ) : (
        <div>Pls Connect Wallet & Change Network to Polygon Mumbai</div>
      )}
    </div>
  );
}
