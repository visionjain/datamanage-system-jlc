import "@/styles/globals.css";
import React, { useState } from 'react'
import { Toaster } from "react-hot-toast";
import 'tailwindcss/tailwind.css';
import LoadingBar from 'react-top-loading-bar'

export default function App({ Component, pageProps: { ...pageProps } }) {
  const [progress, setProgress] = useState(0)
  return (
    <>
      <LoadingBar
        color='#FF0000'
        height='5px'
        progress={100}
        onLoaderFinished={() => setProgress(0)}
      />
      <Toaster />
      <Component {...pageProps} />
    </>
  );
}
