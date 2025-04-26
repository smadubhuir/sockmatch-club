// pages/_app.js
import { SupabaseProvider } from "../context/SupabaseContext";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <SupabaseProvider>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}

export default MyApp;
