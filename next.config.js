/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   async rewrites() {
//     return [
//       {
//         // Setiap kali kamu fetch ke /api/external/..., 
//         // Next.js akan "menembakkannya" ke server tujuan secara internal.
//         source: '/api/external/:path*',
//         destination: 'https://rentoka.olifemassage.com/api/:path*',
//       },
//     ];
//   },
// };

// module.exports = nextConfig;
