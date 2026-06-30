"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  id: string;
  field: "is_active" | "is_featured";
  value: boolean;
}

export function AdminProductToggle({ id, field, value }: Props) {
  const [checked, setChecked] = useState(value);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const next = !checked;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      if (res.ok) {
        setChecked(next);
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-pressed={checked}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
