import NextAuth from "next-auth";
<<<<<<< HEAD
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
=======
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.Credentials({
>>>>>>> e945e55 (Add embedding generation to upload.js, prevent duplicates in sock_embeddings.json)
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = { id: "1", name: "User", email: credentials.email };
        if (credentials.password === "password123") {
          return user;
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
