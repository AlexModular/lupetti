/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Le immagini dei contenuti arrivano dalla CDN di Sanity, già ottimizzate.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
