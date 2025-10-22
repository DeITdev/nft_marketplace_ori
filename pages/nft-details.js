import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import Barcode from 'react-barcode';

import { NFTContext } from '../context/NFTContext';
import { Loader, Button, Modal } from '../components';
import { shortenAddress } from '../utils/shortenAddress';
import images from '../assets';

const PaymentBodyCmp = ({ nft, nftCurrency }) => (
  <div className="flex flex-col">
    <div className="flexBetween">
      <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Item</p>
      <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Subtotal</p>
    </div>

    <div className="flexBetweenStart my-5">
      <div className="flex-1 flexStartCenter">
        <div className="relative w-28 h-28">
          <Image src={nft.image || images[`nft${nft.i}`]} layout="fill" objectFit="cover" />
        </div>
        <div className="flexCenterStart flex-col ml-5">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">{shortenAddress(nft.seller)}</p>
          <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal">{nft.name}</p>
        </div>
      </div>

      <div>
        <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal">{nft.price} <span className="font-semibold">{nftCurrency}</span></p>
      </div>
    </div>

    <div className="flexBetween mt-10">
      <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Total</p>
      <p className="font-poppins dark:text-white text-nft-black-1 text-base minlg:text-xl font-normal">{nft.price} <span className="font-semibold">{nftCurrency}</span></p>
    </div>
  </div>
);

const NFTDetails = () => {
  const { isLoadingNFT, currentAccount, nftCurrency, buyNFT, cancelListing } = useContext(NFTContext);
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState({ image: '', tokenId: '', name: '', owner: '', price: '', seller: '', attributes: [] });
  const router = useRouter();

  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [unlistModal, setUnlistModal] = useState(false);

  // Check if current user owns this NFT
  const isOwner = currentAccount && nft.owner && currentAccount.toLowerCase() === nft.owner.toLowerCase();

  useEffect(() => {
    if (!router.isReady) return;

    const fetchNFTData = async () => {
      const nftData = router.query;

      // If tokenURI exists, fetch full metadata including attributes
      if (nftData.tokenURI) {
        try {
          const { data } = await axios.get(nftData.tokenURI);
          setNft({
            ...nftData,
            attributes: data.attributes || [],
          });
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
          setNft(nftData);
        }
      } else {
        setNft(nftData);
      }

      setIsLoading(false);
    };

    fetchNFTData();
  }, [router.isReady]);

  const checkout = async () => {
    await buyNFT(nft);

    setPaymentModal(false);
    setSuccessModal(true);
  };

  const handleUnlist = async () => {
    await cancelListing(nft.tokenId);

    setUnlistModal(false);
    router.push('/');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="relative flex justify-center md:flex-col min-h-screen">
      <div className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1">
        <div className="relative w-557 minmd:w-2/3 minmd:h-2/3 sm:w-full sm:h-300 h-557">
          <Image
            src={nft.image}
            objectFit="cover"
            className="rounded-xl shadow-lg"
            layout="fill"
          />
        </div>
      </div>

      <div className="flex-1 justify-start sm:px-4 p-12 sm:pb-4 md:max-h-full max-h-screen overflow-y-auto no-scrollbar">
        {/* Print-only header */}
        <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
          <h1 className="font-poppins text-nft-black-1 font-bold text-3xl text-center">Digital Certificate of Authenticity</h1>
          <p className="font-poppins text-nft-black-1 text-sm text-center mt-2">BatikNFT - Blockchain Verified</p>
        </div>

        <div className="flex flex-row sm:flex-col justify-between items-start">
          <h2 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl minlg:text-3xl">{nft.name}</h2>
          {/* Print button only for owners */}
          {isOwner && (
            <Button
              btnName="Print Certificate"
              classStyles="rounded-xl print:hidden sm:mt-4"
              handleClick={handlePrint}
            />
          )}
        </div>

        <div className="mt-10 ">
          <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">Creator</p>
          <div className="flex flex-row items-center mt-3">
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              <Image
                src={images.creator1}
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-base">
              {nft.seller === '0x0000000000000000000000000000000000000000'
                ? 'Original Creator'
                : shortenAddress(nft.seller)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col">
          <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
            <p className="font-poppins dark:text-white text-nft-black-1 font-medium text-base mb-2">Details</p>
          </div>
          <div className="mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-base">{nft.description}</p>
          </div>

          {/* Show Origin and Pattern Type for all users */}
          {nft.attributes && nft.attributes.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {nft.attributes
                .filter((attr) => ['Origin', 'Pattern Type', 'Asset Type'].includes(attr.trait_type))
                .map((attr, index) => (
                  <div key={index} className="dark:bg-nft-black-3 bg-nft-gray-1 rounded-lg p-3">
                    <p className="font-poppins dark:text-white text-nft-black-1 text-xs font-normal opacity-70">
                      {attr.trait_type}
                    </p>
                    <p className="font-poppins dark:text-white text-nft-black-1 text-sm font-semibold mt-1">
                      {attr.value}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Digital Certificate - Only show for owners */}
        {isOwner && nft.attributes && nft.attributes.length > 0 && (
          <div className="mt-10 flex flex-col">
            <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
              <p className="font-poppins dark:text-white text-nft-black-1 font-medium text-base mb-2">Digital Certificate of Authenticity</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {nft.attributes
                .filter((attr) => ['Serial Number', 'Barcode'].includes(attr.trait_type))
                .map((attr, index) => (
                  <div key={index} className="dark:bg-nft-black-3 bg-nft-gray-1 rounded-lg p-3">
                    <p className="font-poppins dark:text-white text-nft-black-1 text-xs font-normal opacity-70">
                      {attr.trait_type}
                    </p>
                    <p className="font-poppins dark:text-white text-nft-black-1 text-sm font-semibold mt-1">
                      {attr.trait_type === 'Barcode' ? (
                        <span className="font-mono">{attr.value}</span>
                      ) : (
                        attr.value
                      )}
                    </p>
                  </div>
                ))}
              {/* Purchase Date */}
              {nft.attributes.find((attr) => attr.trait_type === 'Authentication Date') && (
                <div className="dark:bg-nft-black-3 bg-nft-gray-1 rounded-lg p-3">
                  <p className="font-poppins dark:text-white text-nft-black-1 text-xs font-normal opacity-70">
                    Purchase Date
                  </p>
                  <p className="font-poppins dark:text-white text-nft-black-1 text-sm font-semibold mt-1">
                    {new Date(nft.attributes.find((attr) => attr.trait_type === 'Authentication Date').value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Barcode Image for owners */}
            {nft.attributes.find((attr) => attr.trait_type === 'Barcode') && (
              <div className="mt-6 dark:bg-white bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full p-4 flex flex-col items-center">
                <p className="font-poppins dark:text-nft-black-1 text-nft-black-1 text-sm font-normal opacity-70 mb-3">Barcode for Verification</p>
                <Barcode
                  value={nft.attributes.find((attr) => attr.trait_type === 'Barcode').value}
                  width={2}
                  height={80}
                  background="#ffffff"
                  lineColor="#000000"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-row sm:flex-col mt-10 print:hidden">
          {currentAccount === nft.seller.toLowerCase()
            ? (
              <div className="flex flex-row sm:flex-col w-full">
                <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-base border border-gray p-2 mr-5 sm:mr-0 sm:mb-5">
                  You cannot buy your own NFT
                </p>
                <Button
                  btnName="Unlist NFT"
                  classStyles="rounded-xl"
                  handleClick={() => setUnlistModal(true)}
                />
              </div>
            ) : currentAccount === nft.owner.toLowerCase()
              ? (
                <Button
                  btnName="List on Marketplace"
                  classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                  handleClick={() => router.push(`/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`)}
                />
              ) : (
                <Button
                  btnName={`Buy for ${nft.price} ${nftCurrency}`}
                  classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                  handleClick={() => setPaymentModal(true)}
                />
              )}
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block mt-10 pt-6 border-t border-gray-300">
          <p className="font-poppins text-nft-black-1 text-sm text-center">
            Verified on Blockchain - BatikNFT Digital Certificate
          </p>
          <p className="font-poppins text-nft-black-1 text-xs text-center mt-2 opacity-70">
            Scan the barcode above to verify authenticity
          </p>
        </div>
      </div>
      {paymentModal && (
        <Modal
          header="Check Out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={nftCurrency} />}
          footer={(
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                classStyles="mr-5 sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={checkout}
              />
              <Button
                btnName="Cancel"
                classStyles="rounded-xl"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
          body={(
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {successModal && (
        <Modal
          header="Payment Successful"
          body={(
            <div className="flexCenter flex-col text-center" onClick={() => setSuccessModal(false)}>
              <div className="relative w-52 h-52">
                <Image
                  src={nft.image}
                  objectFit="cover"
                  layout="fill"
                />
              </div>
              <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal mt-10">You successfully purchased <span className="font-semibold">{nft.name}  </span> from <span className="font-semibold">{shortenAddress(nft.seller)}</span></p>
            </div>
          )}
          footer={(
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                classStyles="sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={() => router.push('/my-nfts')}
              />
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {unlistModal && (
        <Modal
          header="Unlist NFT from Marketplace"
          body={(
            <div className="flexCenter flex-col text-center">
              <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-base font-normal mt-5">
                Are you sure you want to unlist <span className="font-semibold">{nft.name}</span> from the marketplace?
              </p>
              <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-sm font-normal mt-3 opacity-70">
                This will remove the listing and return the NFT to your wallet. You can relist it later if you want.
              </p>
            </div>
          )}
          footer={(
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Confirm Unlist"
                classStyles="mr-5 sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={handleUnlist}
              />
              <Button
                btnName="Cancel"
                classStyles="rounded-xl"
                handleClick={() => setUnlistModal(false)}
              />
            </div>
          )}
          handleClose={() => setUnlistModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;
