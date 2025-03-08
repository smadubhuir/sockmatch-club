import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-200 p-4 border-b border-black">
      <div className="flex justify-between">
        <Link href="/">
          <a className="font-bold text-lg">SockMatch.Club</a>
        </Link>
        <Link href="/browse">
          <a>Browse Socks</a>
        </Link>
      </div>
    </nav>
  );
}