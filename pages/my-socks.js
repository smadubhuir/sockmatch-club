import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function getServerSideProps(ctx) {
  const supabase = createSupabaseServerClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { data: socks, error } = await supabase
    .from("socks")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return {
    props: {
      user: session.user,
      socks: socks || [],
    },
  };
}

export default function MySocksPage({ user, socks }) {
  const handleDelete = async (sockId) => {
    const confirmed = window.confirm("Are you sure you want to delete this sock?");
    if (!confirmed) return;

    const res = await fetch("/api/delete-sock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sockId }),
    });

    if (!res.ok) {
      alert("Failed to delete sock.");
    } else {
      window.location.reload(); // simple refresh
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {user.email}'s Uploaded Socks
      </h1>

      {socks.length === 0 ? (
        <p className="text-center">You haven't uploaded any socks yet!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socks.map((sock) => (
            <div key={sock.id} className="border p-4 rounded shadow">
              <img
                src={sock.image_url}
                alt="Sock"
                className="w-full h-48 object-cover rounded mb-4"
              />
              <p>Uploaded on: {new Date(sock.created_at).toLocaleDateString()}</p>
              <button
                onClick={() => handleDelete(sock.id)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
              >
                Delete Sock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
