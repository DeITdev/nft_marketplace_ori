const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'copper-precious-chameleon-276.mypinata.cloud',
      'gateway.pinata.cloud',
      'ipfs.io',
      'dweb.link',
      'cloudflare-ipfs.com',
      '4everland.io',
      'static.vecteezy.com', // placeholder image domain
    ],
  },
  // server: {
  //   host: '0.0.0.0', // Listen on all network interfaces
  //   port: 3000, // You can change the port if needed
  // },

};

module.exports = nextConfig;
