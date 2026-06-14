"use client";
import { useEffect } from "react";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h2>
        <p className="text-slate-500 text-sm mb-4">{error.message}</p>
        <button onClick={reset} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reintentar</button>
      </div>
    </div>
  );
}
