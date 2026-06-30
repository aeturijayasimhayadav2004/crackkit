"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Upload, X, Plus, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string };

export type ExtraFile = {
  id?: string;
  file_path: string;
  display_name: string;
  file_size_mb: number | null;
  sort_order: number;
  _pendingDelete?: boolean;
};

interface ProductFormProps {
  categories: Category[];
  initialData?: Partial<ProductFormState>;
  existingFiles?: ExtraFile[];
  productId?: string;
  isEdit?: boolean;
}

interface ProductFormState {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category_id: string;
  price_inr: string;
  original_price_inr: string;
  cover_image_url: string;
  file_path: string;
  file_size_mb: string;
  pages: string;
  tags: string;
  is_active: boolean;
  is_featured: boolean;
  difficulty_level: string;
  language: string;
  preview_url: string;
}

const EMPTY: ProductFormState = {
  title: "",
  slug: "",
  description: "",
  long_description: "",
  category_id: "",
  price_inr: "",
  original_price_inr: "",
  cover_image_url: "",
  file_path: "",
  file_size_mb: "",
  pages: "",
  tags: "",
  is_active: true,
  is_featured: false,
  difficulty_level: "Intermediate",
  language: "English",
  preview_url: "",
};

export function ProductForm({ categories, initialData, existingFiles, productId, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>({ ...EMPTY, ...initialData });
  const [extraFiles, setExtraFiles] = useState<ExtraFile[]>(existingFiles ?? []);
  const [notifySubscribers, setNotifySubscribers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"pdf" | "cover" | null>(null);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const set = (k: keyof ProductFormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const slugify = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!isEdit) set("slug", slugify(v));
  };

  const uploadFile = async (file: File, type: "pdf" | "cover") => {
    setUploading(type);
    try {
      const ext = file.name.split(".").pop() ?? (type === "pdf" ? "pdf" : "jpg");
      const base = form.slug || slugify(form.title) || "product";
      const name = `${base}-${Date.now()}.${ext}`;

      if (type === "cover") {
        // Upload cover images directly via Supabase client SDK (no Vercel size limit)
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("product-covers")
          .upload(name, file, { upsert: true, contentType: file.type || "image/jpeg" });
        if (error) { toast.error(`Upload failed: ${error.message}`); return; }
        const { data: urlData } = supabase.storage.from("product-covers").getPublicUrl(data.path);
        set("cover_image_url", urlData.publicUrl);
        toast.success("Cover uploaded");
        return;
      }

      // PDFs: use signed URL so the file goes directly to Supabase (bypasses Vercel size limits)
      const signRes = await fetch("/api/admin/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name }),
      });
      if (!signRes.ok) {
        const text = await signRes.text();
        let msg = `HTTP ${signRes.status}`;
        try { msg = JSON.parse(text).error ?? msg; } catch { msg = text || msg; }
        toast.error(`Upload failed: ${msg}`);
        return;
      }
      const { signedUrl, path } = await signRes.json();

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!uploadRes.ok) {
        toast.error(`Upload failed: HTTP ${uploadRes.status}`);
        return;
      }
      set("file_path", path);
      toast.success("PDF uploaded → path saved");
    } catch (err) {
      toast.error(`Upload error: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setUploading(null);
    }
  };

  const uploadExtraFile = async (file: File) => {
    setUploadingExtra(true);
    try {
      const base = form.slug || slugify(form.title) || "product";
      const name = `${base}-extra-${Date.now()}.pdf`;

      const signRes = await fetch("/api/admin/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "pdf", name }),
      });
      if (!signRes.ok) {
        const text = await signRes.text();
        let msg = `HTTP ${signRes.status}`;
        try { msg = JSON.parse(text).error ?? msg; } catch { msg = text || msg; }
        toast.error(`Upload failed: ${msg}`);
        return;
      }
      const { signedUrl, path } = await signRes.json();

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!uploadRes.ok) {
        toast.error(`Upload failed: HTTP ${uploadRes.status}`);
        return;
      }

      setExtraFiles((prev) => [
        ...prev,
        {
          file_path: path,
          display_name: file.name.replace(/\.pdf$/i, ""),
          file_size_mb: null,
          sort_order: prev.filter((f) => !f._pendingDelete).length,
        },
      ]);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(`Upload error: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setUploadingExtra(false);
    }
  };

  const removeExtraFile = (index: number) => {
    setExtraFiles((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f;
        return f.id ? { ...f, _pendingDelete: true } : null!;
      }).filter(Boolean)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      long_description: form.long_description || null,
      category_id: form.category_id || null,
      price_inr: parseInt(form.price_inr) * 100,
      original_price_inr: form.original_price_inr ? parseInt(form.original_price_inr) * 100 : null,
      cover_image_url: form.cover_image_url || null,
      file_path: form.file_path,
      file_size_mb: form.file_size_mb ? parseFloat(form.file_size_mb) : null,
      pages: form.pages ? parseInt(form.pages) : null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      is_active: form.is_active,
      is_featured: form.is_featured,
      difficulty_level: form.difficulty_level || null,
      language: form.language || "English",
      preview_url: form.preview_url || null,
    };

    const url = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error("Save failed: " + JSON.stringify(err.error));
      setSaving(false);
      return;
    }

    const saved = await res.json();
    const savedId = isEdit ? productId! : saved.id;

    // Sync extra files
    const toDelete = extraFiles.filter((f) => f._pendingDelete && f.id);
    const toAdd = extraFiles.filter((f) => !f._pendingDelete && !f.id);

    if (toDelete.length > 0 || toAdd.length > 0) {
      await Promise.all([
        ...toDelete.map((f) =>
          fetch(`/api/admin/products/${savedId}/files/${f.id}`, { method: "DELETE" })
        ),
        ...toAdd.map((f, i) =>
          fetch(`/api/admin/products/${savedId}/files`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_path: f.file_path,
              display_name: f.display_name,
              file_size_mb: f.file_size_mb,
              sort_order: f.sort_order ?? i,
            }),
          })
        ),
      ]);
    }

    // Optionally email subscribers about new drop
    if (!isEdit && notifySubscribers) {
      const notifyRes = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: form.title,
          productSlug: form.slug,
          description: form.description,
          priceRupees: parseInt(form.price_inr),
        }),
      });
      const nd = await notifyRes.json();
      if (nd.skipped) {
        toast(nd.reason, { icon: "ℹ️" });
      } else if (nd.ok) {
        toast.success(`Notified ${nd.sent} subscribers!`);
      }
    }

    toast.success(isEdit ? "Product updated!" : "Product created!");
    router.push(`/admin/products/${savedId}/edit`);
    router.refresh();
    setSaving(false);
  };

  const inputCls =
    "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-secondary focus:border-primary focus:outline-none";
  const labelCls = "block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider";

  const visibleExtraFiles = extraFiles.filter((f) => !f._pendingDelete);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Title + slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ultimate DSA Bundle"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input
            required
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="ultimate-dsa-bundle"
            pattern="[a-z0-9-]+"
            className={inputCls}
          />
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <label className={labelCls}>Short Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="One-line pitch shown on cards"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Long Description</label>
        <textarea
          rows={4}
          value={form.long_description}
          onChange={(e) => set("long_description", e.target.value)}
          placeholder="Full details shown on product page"
          className={inputCls}
        />
      </div>

      {/* Category + difficulty + language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className={inputCls}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Difficulty</label>
          <select
            value={form.difficulty_level}
            onChange={(e) => set("difficulty_level", e.target.value)}
            className={inputCls}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Language</label>
          <input
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            placeholder="English"
            className={inputCls}
          />
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Price ₹ (INR) *</label>
          <input
            required
            type="number"
            min="1"
            value={form.price_inr}
            onChange={(e) => set("price_inr", e.target.value)}
            placeholder="299"
            className={inputCls}
          />
          <p className="text-[11px] text-text-secondary mt-1">Enter in rupees (₹299, not paise)</p>
        </div>
        <div>
          <label className={labelCls}>Original Price ₹ (crossed out)</label>
          <input
            type="number"
            min="1"
            value={form.original_price_inr}
            onChange={(e) => set("original_price_inr", e.target.value)}
            placeholder="2999"
            className={inputCls}
          />
        </div>
      </div>

      {/* Primary PDF upload */}
      <div>
        <label className={labelCls}>Primary PDF File *</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              required={!isEdit}
              value={form.file_path}
              onChange={(e) => set("file_path", e.target.value)}
              placeholder="product-files/dsa-bundle.pdf"
              className={inputCls}
            />
            <p className="text-[11px] text-text-secondary mt-1">Storage path — auto-filled on upload, or type manually</p>
          </div>
          <label className="flex-shrink-0 flex items-center gap-2 cursor-pointer bg-surface border border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white transition-colors">
            {uploading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload PDF
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "pdf")}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className={labelCls}>File size (MB)</label>
            <input
              type="number"
              step="0.1"
              value={form.file_size_mb}
              onChange={(e) => set("file_size_mb", e.target.value)}
              placeholder="8.5"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Pages</label>
            <input
              type="number"
              value={form.pages}
              onChange={(e) => set("pages", e.target.value)}
              placeholder="300"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Additional PDF files */}
      <div>
        <label className={labelCls}>Additional Files</label>
        <div className="space-y-2">
          {visibleExtraFiles.map((file, i) => (
            <div
              key={file.id ?? i}
              className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-2.5"
            >
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <input
                value={file.display_name}
                onChange={(e) =>
                  setExtraFiles((prev) =>
                    prev.map((f, j) =>
                      j === extraFiles.indexOf(file) ? { ...f, display_name: e.target.value } : f
                    )
                  )
                }
                placeholder="Display name (e.g. Part 1 - Arrays)"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-text-secondary focus:outline-none min-w-0"
              />
              <span className="text-[11px] text-text-secondary truncate max-w-[130px] hidden sm:block">
                {file.file_path.split("/").pop()}
              </span>
              <button
                type="button"
                onClick={() => removeExtraFile(extraFiles.indexOf(file))}
                className="text-text-secondary hover:text-badge transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <label className="inline-flex items-center gap-2 cursor-pointer bg-surface border border-dashed border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white transition-colors">
            {uploadingExtra ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Another PDF
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadExtraFile(e.target.files[0])}
            />
          </label>
        </div>
        <p className="text-[11px] text-text-secondary mt-2">
          Users who purchase this product can download all files listed here.
        </p>
      </div>

      {/* Cover image upload */}
      <div>
        <label className={labelCls}>Cover Image</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
          <label className="flex-shrink-0 flex items-center gap-2 cursor-pointer bg-surface border border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white transition-colors">
            {uploading === "cover" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "cover")}
            />
          </label>
        </div>
        {form.cover_image_url && (
          <div className="mt-2 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.cover_image_url} alt="cover preview" className="h-20 rounded-lg border border-border object-cover" />
            <button
              type="button"
              onClick={() => set("cover_image_url", "")}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-badge flex items-center justify-center text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className={labelCls}>Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="DSA, LeetCode, Arrays"
          className={inputCls}
        />
      </div>

      {/* Preview URL */}
      <div>
        <label className={labelCls}>Preview URL (optional)</label>
        <input
          value={form.preview_url}
          onChange={(e) => set("preview_url", e.target.value)}
          placeholder="https://... (public preview PDF link)"
          className={inputCls}
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        {(["is_active", "is_featured"] as const).map((field) => (
          <label key={field} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form[field]}
              onChange={(e) => set(field, e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-text-secondary capitalize">{field.replace(/_/g, " ")}</span>
          </label>
        ))}

        {!isEdit && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifySubscribers}
              onChange={(e) => setNotifySubscribers(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-text-secondary">Notify subscribers (new drop email)</span>
          </label>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
