"use client";

import { useState, useEffect } from "react";

export default function Toast({ message, duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black text-white py-2 px-4 rounded shadow-lg text-sm z-50">
      {message}
    </div>
  );
}

