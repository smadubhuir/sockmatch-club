"use client";
import "../styles/globals.css";
import { SupabaseProvider } from "../context/SupabaseContext";

export default function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}
