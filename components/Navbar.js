"use client"; 
import React from "React";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
 s
<<<<<<< HEAD

=======
>>>>>>> e945e55 (Add embedding generation to upload.js, prevent duplicates in sock_embeddings.json)
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
