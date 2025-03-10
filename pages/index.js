"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [socks, setSocks] = useState([]);

useEffect(() => {
  fetch("/api/get-socks")
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched socks:", data.socks); // Debugging log
      if (data && data.socks) {
        setSocks(data.socks.slice(0, 6)); 
      } else {
        console.error("No socks data received.");
        setSocks([]);
      }
    })
    .catch((error) => {
      console.error("Error fetching socks:", error);
      setSocks([]);
    });
}, []);



  return (
    <div className="flex flex-col items-center p-10 space-y-8 text-center font-sans text-black bg-gray-100 min-h-screen">
      {/* Artwork at the top */}
      <img src="https://res.cloudinary.com/dilhl61st/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v1741624889/sockmatch/374283b4b62bb52e316d5f101.jpg
" alt="SockMatch Club Art" className="w-full max-w-3xl rounded-lg shadow-md mb-6" />

<h1 className="text-4xl font-bold underline">Welcome to SockMatch.Club</h1>
      <p className="text-md max-w-2xl">
        Lost a sock? Looking for a quirky mismatch? SockMatch.Club helps you find a new pair for your lonely socks. 
        Upload a sock, set a price, and discover the best match!
      </p>

      {/* Get Started Button */}
      <Link href="/upload">
        <button className="border border-black bg-blue-500 text-white px-6 py-2 text-md font-bold uppercase hover:bg-blue-600 transition">
          Get Started
        </button>
      </Link>
<div className="bg-red-500 text-white p-4 text-center">Tailwind is working!</div>

      {/* Latest Uploaded Socks Section */}
<h2 className="text-2xl font-semibold mt-12">Socks Seeking Matches</h2>

{/* Ensure grid layout applies correctly */}
<div className="w-full max-w-4xl mx-auto">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 border border-red-500">
    {socks.length > 0 ? (
      socks.map((sock, index) => (
        <div 
          key={index} 
          className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center justify-center border border-blue-500"
        >
          <img 
            src={sock.imageUrl} 
            alt="Sock" 
            className="w-40 h-40 object-contain rounded-md mb-2 border border-green-500"
          />
          <p className="text-sm text-gray-700 text-center w-full break-words">
            {sock.name || "Unnamed Sock"}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 col-span-2 md:col-span-3 text-center">
        No socks uploaded yet.
      </p>
    )}
  </div>
</div>


      {/* Browse More Button */}
      <div className="flex space-x-4">
        <Link href="/browse">
          <button className="border border-black bg-gray-200 text-black px-6 py-2 text-md font-bold uppercase hover:bg-gray-300 transition">
            Browse Socks
          </button>
        </Link>
      </div>
    </div>
  );
}
