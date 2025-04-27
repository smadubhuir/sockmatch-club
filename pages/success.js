"use client";

import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-8">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🎉 Payment Successful!</h1>
      <p className="text-lg text-center mb-6">
        Thanks for supporting SockMatch. Your sock is now matched up and ready to ship!
      </p>

      <Link href="/browse">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
          Browse More Socks
        </button>
      </Link>
    </div>
  );
}

