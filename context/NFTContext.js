import React, { useState, useEffect } from 'react';
import Web3modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

// Alchemy RPC for Sepolia
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const sepoliaRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;

// Pinata for IPFS
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_GATEWAY = 'https://copper-precious-chameleon-276.mypinata.cloud/ipfs/'; // Your dedicated gateway

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No account found');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    setCurrentAccount(accounts[0]);

    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        },
      );

      // Use your dedicated gateway
      const url = `${PINATA_GATEWAY}${response.data.IpfsHash}`;
      console.log('✅ Image uploaded to IPFS:', url);
      return url;
    } catch (error) {
      console.log('Error uploading file to IPFS:', error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, { value: listingPrice.toString() })
      : await contract.resellToken(id, price, { value: listingPrice.toString() });

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const mintNFT = async (url) => {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    // Mint NFT without listing for sale using the new mintToken function
    const transaction = await contract.mintToken(url);

    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const createNFT = async (formInput, fileUrl, router, serialNumber, barcodeNumber, origin, patternType, listForSale = true) => {
    const { name, description, price } = formInput;

    if (!name || !description || !fileUrl) return;
    if (listForSale && !price) return;

    // Create metadata with Batik attributes including serial number and barcode
    const metadata = {
      name,
      description,
      image: fileUrl,
      attributes: [
        {
          trait_type: 'Serial Number',
          value: serialNumber,
        },
        {
          trait_type: 'Barcode',
          value: barcodeNumber,
        },
        {
          trait_type: 'Asset Type',
          value: 'Batik',
        },
        {
          trait_type: 'Authentication Date',
          value: new Date().toISOString(),
        },
        {
          trait_type: 'Origin',
          value: origin || 'Unknown',
        },
        {
          trait_type: 'Pattern Type',
          value: patternType || 'Traditional',
        },
      ],
    };

    const data = JSON.stringify(metadata);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        JSON.parse(data),
        {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        },
      );

      // Use your dedicated gateway
      const url = `${PINATA_GATEWAY}${response.data.IpfsHash}`;
      console.log('✅ Metadata uploaded to IPFS:', url);
      console.log('📊 Serial Number:', serialNumber);
      console.log('📊 Barcode:', barcodeNumber);

      if (listForSale) {
        await createSale(url, price);
      } else {
        await mintNFT(url);
      }

      router.push('/');
    } catch (error) {
      console.log('Error uploading metadata to IPFS:', error);
    }
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);

    const provider = new ethers.providers.JsonRpcProvider(sepoliaRpcUrl);
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description, attributes } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        attributes,
        tokenURI,
      };
    }));

    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);

    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data = type === 'fetchItemsListed'
      ? await contract.fetchItemsListed()
      : await contract.fetchMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description, attributes } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        attributes,
        tokenURI,
      };
    }));

    return items;
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  const cancelListing = async (tokenId) => {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const transaction = await contract.cancelListing(tokenId);

    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        currentAccount,
        connectWallet,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
        cancelListing,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
