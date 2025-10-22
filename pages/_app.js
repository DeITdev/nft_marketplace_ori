import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import Head from 'next/head';

import { NFTProvider } from '../context/NFTContext';
import { Navbar, Footer } from '../components';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => (
  <NFTProvider>
    <ThemeProvider attribute="class">
      <Head>
        <title>BatikNFT - Authentic Batik Marketplace</title>
        <meta name="description" content="BatikNFT - Digital authentication for authentic Indonesian Batik" />
        <link rel="icon" href="/iconBatik.svg" />
      </Head>

      <div className="dark:bg-nft-dark bg-white min-h-screen">
        <Navbar />
        <div className="pt-65">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>

      <Script src="https://kit.fontawesome.com/94c83e3ca9.js" crossorigin="anonymous" />
    </ThemeProvider>
  </NFTProvider>
);

export default MyApp;
