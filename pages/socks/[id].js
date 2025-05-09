"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function SockDetailPage() {
  const [sock, setSock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [offerModal, setOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
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
      setSock(data);
    } catch (err) {
      setError("Failed to load sock details.");
      console.error("Error fetching sock details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = () => {
    setOfferModal(true);
  };

  const submitOffer = async () => {
    if (!offerAmount || isNaN(offerAmount)) {
      alert("Please enter a valid offer amount.");
      return;
    }

    try {
      const { error } = await supabase
        .from("socks")
        .update({ buy_offer: parseFloat(offerAmount) })
        .eq("id", sock.id);

      if (error) throw error;

      setSock({ ...sock, buy_offer: parseFloat(offerAmount) });
      setOfferModal(false);
      alert("Your offer has been submitted!");
    } catch (err) {
      console.error("Error submitting offer:", err);
      alert("Failed to submit your offer. Please try again.");
    }
  };

  const handleEditSock = () => {
    router.push(`/socks/edit/${sock.id}`);
  };

  if (loading) return <p className="text-blue-500">Loading sock details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {sock ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <img src={sock.image_url} alt="Sock Image" className="w-48 h-48 object-cover rounded mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sock Details</h1>
          <p><strong>Description:</strong> {sock.description}</p>
          <p><strong>Sell Price:</strong> ${sock.price_sell || "Not set"}</p>
          <p><strong>Current Buy Offer:</strong> ${sock.buy_offer || "None yet"}</p>

          <div className="mt-4 space-x-2">
            {sock.price_sell ? (
              <button className="px-4 py-2 bg-green-500 text-white rounded">
                Buy for ${sock.price_sell}
              </button>
            ) : (
              <button onClick={handleMakeOffer} className="px-4 py-2 bg-green-500 text-white rounded">
                Make an Offer
              </button>
            )}

            {user && sock.uploader_id === user.id && (
              <button onClick={handleEditSock} className="px-4 py-2 bg-yellow-500 text-white rounded">Edit</button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Sock not found.</p>
      )}

      <button onClick={() => router.push("/browse")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Back to Browse</button>

      {/* Offer Modal */}
      {offerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <h2 className="text-xl font-bold mb-4">Make an Offer</h2>
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Enter your offer amount"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setOfferModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              <button onClick={submitOffer} className="px-4 py-2 bg-green-500 text-white rounded">Submit Offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
