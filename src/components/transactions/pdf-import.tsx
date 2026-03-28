"use client";

import { useRef, useState } from "react";

interface Props {
  onImported: () => void;
}

export function PdfImport({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setStatus("loading");
    setMessage("");

    const form = new FormData();
    form.append("file", file);
    form.append("source", "credit_card");

    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        onImported();
      } else {
        setStatus("error");
        setMessage(data.error ?? "Fehler beim Import");
      }
    } catch {
      setStatus("error");
      setMessage("Netzwerkfehler");
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 4000);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv"
        className="hidden"
        onChange={onInputChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={status === "loading"}
        className={`w-full border border-dashed rounded-lg py-5 text-sm transition-colors ${
          dragging
            ? "border-zinc-500 bg-zinc-800/50 text-zinc-200"
            : status === "loading"
            ? "border-zinc-800 text-zinc-500 cursor-not-allowed"
            : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
        }`}
      >
        {status === "loading"
          ? "Wird importiert..."
          : status === "success"
          ? message
          : status === "error"
          ? message
          : "PDF oder CSV hier ablegen oder klicken"}
      </button>
    </div>
  );
}
