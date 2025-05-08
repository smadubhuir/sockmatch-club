// pages/_app.js
import "@/styles/globals.css";
import { SupabaseProvider } from "@/context/SupabaseContext";
import Navbar from "@/components/Navbar";

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <Navbar />
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}

export default MyApp;
