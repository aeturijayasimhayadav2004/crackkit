"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Loader2 } from "lucide-react";

export function AdminDeleteProduct({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${title}" deleted`);
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error("Delete failed");
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-badge">Delete &quot;{title}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-badge/20 hover:bg-badge/30 text-badge px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Confirm Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-text-secondary hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-badge px-3 py-1.5 rounded-lg border border-border hover:border-badge/40 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" /> Delete
    </button>
  );
}
