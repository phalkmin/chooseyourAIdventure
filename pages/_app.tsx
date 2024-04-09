import { AppProps } from 'next/app';
import React from 'react';
import Head from 'next/head';

import "./styles/globals.css";
import "./styles/nes.css";
import "./styles/fonts.css";



function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
