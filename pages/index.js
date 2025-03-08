"use client"; 
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center p-10 space-y-8 text-center font-sans text-black bg-gray-100">
      <h1 className="text-4xl font-bold underline">Welcome to SockMatch.Club</h1>
      <p className="text-md max-w-2xl">
        Lost a sock? Looking for a quirky mismatch? SockMatch.Club helps you find a new pair for your lonely socks. 
        Upload a sock, set a price, and discover the best match!
      </p>

      <div className="flex space-x-4">
      <Link href="/browse" className="border border-black bg-gray-200 text-black px-6 py-2 text-md font-bold uppercase">
  Browse Socks
</Link>
      </div>
    </div>
  );
}