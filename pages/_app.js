"use client";

import "@/styles/globals.css";
import { SupabaseProvider } from "@/context/SupabaseContext";

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}

export default MyApp;
