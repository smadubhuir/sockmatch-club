// /components/SockCard.js
import Link from "next/link";

export default function SockCard({ sock }) {
  return (
    <div className="border p-4 rounded shadow bg-white hover:shadow-md transition">
      <img
        src={sock.image_url || sock.imageUrl}
        alt="Sock Image"
        className="w-32 mx-auto rounded mb-2"
      />
      <p className="font-bold">SockRank: {(sock.similarity * 100).toFixed(2)}%</p>
      <p className="text-sm">Sell Price: ${sock.price_sell || "N/A"}</p>
      <p className="text-sm">Buy Offer: ${sock.buy_offer || "None"}</p>

      <div className="mt-2">
        <Link href={`/socks/${sock.id}`}>
          <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded w-full">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}

