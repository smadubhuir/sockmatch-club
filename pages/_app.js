"use client";

import "@/styles/globals.css";
import { SupabaseProvider } from "@/context/SupabaseContext";
import Navbar from "@/components/Navbar"; // Importing the Navbar component

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      {/* Global Navbar for all pages */}
      <Navbar />
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}

export default MyApp;
