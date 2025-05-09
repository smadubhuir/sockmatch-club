"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function EditSockPage() {
  const [sock, setSock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchSockDetails(id);
  }, [id]);

  const fetchSockDetails = async (sockId) => {
    try {
      const { data, error } = await supabase
        .from("socks")
        .select("*")
        .eq("id", sockId)
        .single();

      if (error) throw error;

      if (data.uploader_id !== user?.id) {
        router.push("/browse");
        return;
      }

      setSock(data);
    } catch (err) {
      setError("Failed to load sock details.");
      console.error("Error fetching sock details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await supabase
        .from("socks")
        .update({ description: sock.description, price: sock.price })
        .eq("id", sock.id);

      router.push(`/socks/${sock.id}`);
    } catch (err) {
      setError("Failed to save changes.");
      console.error("Error saving changes:", err);
    }
  };

  const handleDeleteSock = async () => {
    if (!confirm("Are you sure you want to delete this sock?")) return;

    await supabase
      .from("socks")
      .delete()
      .eq("id", sock.id);

    router.push("/browse");
  };

  if (loading) return <p>Loading sock details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Sock</h1>
      {sock ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <img src={sock.image_url} alt="Sock Image" className="w-48 h-48 object-cover rounded mb-4" />
          <label>Description:</label>
          <input type="text" value={sock.description} onChange={(e) => setSock({ ...sock, description: e.target.value })} className="w-full p-2 mb-4 border" />

          <label>Price:</label>
          <input type="number" value={sock.price || ""} onChange={(e) => setSock({ ...sock, price: e.target.value })} className="w-full p-2 mb-4 border" />

          <div className="flex space-x-4">
            <button onClick={handleSaveChanges} className="px-4 py-2 bg-blue-500 text-white rounded">Save Changes</button>
            <button onClick={handleDeleteSock} className="px-4 py-2 bg-red-500 text-white rounded">Delete Sock</button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <button onClick={() => router.push(`/socks/${id}`)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
    </div>
  );
}
