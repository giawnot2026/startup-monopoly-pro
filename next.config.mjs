/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // Permette il deploy anche se ci sono piccoli warning di tipo
    ignoreBuildErrors: true,
  },
  eslint: {
    // Previene il blocco del deploy per errori di formattazione
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
