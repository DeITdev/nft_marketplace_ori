import { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Barcode from 'react-barcode';

import { NFTContext } from '../context/NFTContext';
import { Button, Input, Loader } from '../components';
import images from '../assets';
import { generateSerialNumber, generateBarcodeNumber, generateSequenceNumber } from '../utils/generateSerialNumber';

const CreateNFT = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    price: '',
    name: '',
    description: '',
    origin: '',
    patternType: '',
  });
  const [serialNumber, setSerialNumber] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [listForSale, setListForSale] = useState(true);
  const { theme } = useTheme();
  const { isLoadingNFT, uploadToIPFS, createNFT } = useContext(NFTContext);
  const router = useRouter();

  // Auto-generate serial number when component mounts
  useEffect(() => {
    const sequence = generateSequenceNumber();
    const serial = generateSerialNumber(sequence);
    const barcode = generateBarcodeNumber(serial);

    setSerialNumber(serial);
    setBarcodeNumber(barcode);
  }, []);

  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);

    setFileUrl(url);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize: 5000000,
  });

  const fileStyle = useMemo(() => (
    `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed
    ${isDragActive && 'border-file-active'}
    ${isDragAccept && 'border-file-accept'}
    ${isDragReject && 'border-file-reject'}`
  ), []);

  if (isLoadingNFT) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">Create New Batik NFT</h1>
        <div className="mt-16">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">Upload Batik Image</p>
          <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">JPG, PNG, GIF, SVG, WEBM Max 100mb.</p>
                <div className="my-12 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    width={100}
                    height={100}
                    objectFit="contain"
                    alt="file upload"
                    className={theme === 'light' ? 'filter invert' : ''}
                  />
                </div>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">Drag and Drop File</p>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">or Browse media on your device</p>
              </div>
            </div>
            {fileUrl && (
              <aside>
                <div>
                  <img src={fileUrl} alt="asset_file" />
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Serial Number Display (Read-only) */}
        <div className="mt-10">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl mb-2">Digital Certificate of Authenticity</p>

          <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-poppins dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3">
            <p className="text-sm opacity-70 mb-1">Serial Number (Auto-generated)</p>
            <p className="font-semibold">{serialNumber}</p>
          </div>

          <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-poppins dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3">
            <p className="text-sm opacity-70 mb-1">Barcode Number</p>
            <p className="font-semibold font-mono">{barcodeNumber}</p>
          </div>

          {/* Barcode Image */}
          {barcodeNumber && (
            <div className="dark:bg-white bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none mt-4 px-4 py-3 flex flex-col items-center">
              <p className="font-poppins dark:text-nft-black-1 text-nft-black-1 text-sm opacity-70 mb-3">Barcode Image (Ready to Print)</p>
              <Barcode
                value={barcodeNumber}
                width={2}
                height={80}
                displayValue
                background="#ffffff"
                lineColor="#000000"
              />
            </div>
          )}
        </div>

        <Input
          inputType="input"
          title="Batik Name"
          placeholder="Enter batik name"
          handleClick={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <Input
          inputType="textarea"
          title="Description"
          placeholder="Batik description, history, and significance"
          handleClick={(e) => setFormInput({ ...formInput, description: e.target.value })}
        />
        <Input
          inputType="input"
          title="Origin/Region"
          placeholder="e.g., Yogyakarta, Solo, Pekalongan"
          handleClick={(e) => setFormInput({ ...formInput, origin: e.target.value })}
        />
        <Input
          inputType="input"
          title="Pattern Type"
          placeholder="e.g., Parang, Kawung, Mega Mendung"
          handleClick={(e) => setFormInput({ ...formInput, patternType: e.target.value })}
        />

        {/* List for Sale Checkbox */}
        <div className="mt-10">
          <div className="flex flex-row items-center">
            <input
              type="checkbox"
              id="listForSale"
              checked={listForSale}
              onChange={(e) => setListForSale(e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <label
              htmlFor="listForSale"
              className="ml-3 font-poppins dark:text-white text-nft-black-1 font-semibold text-base cursor-pointer"
            >
              List for sale immediately
            </label>
          </div>
          <p className="font-poppins dark:text-white text-nft-black-1 text-sm opacity-70 mt-2 ml-8">
            {listForSale
              ? 'NFT will be listed on the marketplace after minting'
              : 'NFT will be minted to your wallet without listing'}
          </p>
        </div>

        {/* Price field - only show if listing for sale */}
        {listForSale && (
          <Input
            inputType="number"
            title="Price"
            placeholder="NFT Price in ETH"
            handleClick={(e) => setFormInput({ ...formInput, price: e.target.value })}
          />
        )}

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName={listForSale ? 'Create & List NFT' : 'Mint NFT'}
            classStyles="rounded-xl"
            handleClick={() => createNFT(formInput, fileUrl, router, serialNumber, barcodeNumber, formInput.origin, formInput.patternType, listForSale)}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateNFT;
