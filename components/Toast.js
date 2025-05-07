"use client";

export default function Toast({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow-md animate-fade">
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-red-400 hover:underline text-sm"
      >
        Close
      </button>
    </div>
  );
}
