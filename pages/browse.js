import { useState } from "react";
import Link from "next/link";

export default function BrowseSocksPage() {
  const sockImages = [
    { src: "/images/sock1.jpeg", color: "red", pattern: "striped", price: 5 },
    { src: "/images/sock2.webp", color: "pink", pattern: "graphic", price: 7 },
    { src: "/images/sock3.jpeg", color: "blue", pattern: "solid", price: 4 },
    { src: "/images/sock4.jpg", color: "red", pattern: "striped", price: 6 },
    { src: "/images/sock5.webp", color: "white", pattern: "striped", price: 3 }
  ];

  const [filter, setFilter] = useState({ color: "", pattern: "", sortOrder: "desc" });

  const filteredSocks = sockImages
    .filter(sock => 
      (filter.color === "" || sock.color === filter.color) &&
      (filter.pattern === "" || sock.pattern === filter.pattern)
    )
    .sort((a, b) => filter.sortOrder === "desc" ? b.price - a.price : a.price - b.price);

  return (
    <div className="flex flex-col items-center p-10 space-y-8 text-center font-sans text-black bg-gray-100">
      <nav className="absolute top-4 left-4">
      <Link href="/" className="border border-black p-2 bg-gray-200">
  ⬅ Back to Home
</Link>
      </nav>

      <h1 className="text-4xl font-bold underline">Browse Socks</h1>
      <p className="text-md max-w-2xl">
        Explore available socks and find your perfect match!
      </p>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select className="border border-black p-2" value={filter.color} onChange={e => setFilter({ ...filter, color: e.target.value })}>
          <option value="">All Colors</option>
          <option value="red">Red</option>
          <option value="pink">Pink</option>
          <option value="blue">Blue</option>
          <option value="white">White</option>
        </select>

        <select className="border border-black p-2" value={filter.pattern} onChange={e => setFilter({ ...filter, pattern: e.target.value })}>
          <option value="">All Patterns</option>
          <option value="striped">Striped</option>
          <option value="graphic">Graphic</option>
          <option value="solid">Solid</option>
        </select>

        <select className="border border-black p-2" value={filter.sortOrder} onChange={e => setFilter({ ...filter, sortOrder: e.target.value })}>
          <option value="desc">Socks by $$$ (High to Low)</option>
          <option value="asc">Socks by $$$ (Low to High)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {filteredSocks.map((sock, index) => (
          <div key={index} className="border border-black p-2 flex flex-col items-center justify-center">
            <img src={sock.src} alt={`Sock ${index + 1}`} className="w-40 h-40 object-contain" onError={(e) => e.target.style.display='none'} />
            <p className="text-sm mt-2">{sock.color} - {sock.pattern} - ${sock.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

