"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [socks, setSocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocks = async () => {
      try {
        const res = await fetch("/api/list-socks");
        const data = await res.json();
        console.log("Fetched socks:", data);

        // Some versions return { socks: [...] }, others just [...]
        const sockArray = data?.socks || data;

        if (Array.isArray(sockArray)) {
          setSocks(sockArray.slice(0, 6));
        } else {
          console.error("Invalid sock data format.");
          setSocks([]);
        }
      } catch (error) {
        console.error("Error fetching socks:", error);
        setSocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSocks();
  }, []);

  return (
    <div className="flex flex-col items-center p-10 space-y-8 text-center font-sans text-black bg-white min-h-screen">
      <img 
        src="https://res.cloudinary.com/dilhl61st/image/upload/q_auto,f_auto/v1741624889/sockmatch/374283b4b62bb52e316d5f101.jpg"
        alt="SockMatch Club Art" 
        className="w-80 md:w-[25rem] object-cover rounded-lg mb-6" 
      />

      <h1 className="text-4xl font-bold underline">Welcome to SockMatch.Club</h1>
      <p className="text-md max-w-2xl">
        Lost a sock? Looking for a quirky mismatch? SockMatch.Club helps you find a new pair for your lonely socks. 
        Upload a sock, set a price, and discover the best match!
      </p>

      <Link href="/upload">
        <button className="border border-black bg-blue-500 text-white px-6 py-2 text-md font-bold uppercase hover:bg-blue-600 transition">
          Get Started
        </button>
      </Link>
     
      <h2 className="text-2xl font-semibold mt-12">Socks Seeking Matches:</h2>

      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-gray-400">Loading socks...</p>
          ) : socks.length > 0 ? (
            socks.map((sock, index) => (
              <div 
                key={index} 
                className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center"
              >
                <img 
                  src={sock.image_url || "/placeholder.png"} 
                  alt="Sock" 
                  className="w-40 h-40 object-cover rounded-md mb-2"
                />
                <p className="text-sm text-gray-700 text-center w-full break-words">
                  {sock.name || "Unnamed Sock"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No socks uploaded yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mt-8">
        <Link href="/browse">
          <button className="border border-black bg-gray-200 text-black px-6 py-2 text-md font-bold uppercase hover:bg-gray-300 transition">
            Browse More Socks
          </button>
        </Link>
      </div>
    </div>
  );
}
