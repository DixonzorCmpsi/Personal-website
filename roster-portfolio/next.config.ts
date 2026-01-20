// next.config.ts

import type { NextConfig } from "next";



const nextConfig: NextConfig = {

  output: 'standalone', // Required for Docker deployment

  images: {

    remotePatterns: [

      {

        protocol: 'https',

        hostname: 'avatars.githubusercontent.com', // Allow GitHub profile pics

        port: '',

        pathname: '/**',

      },

      {

        protocol: 'https',

        hostname: 'github.com', // Just in case

        port: '',

        pathname: '/**',

      },

    ],

  },

};



export default nextConfig;
