import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FilePicker from "@/components/common/FilePicker";
import WysiwygEditor from "@/components/common/WysiwygEditor";
import TagsInput from "@/components/common/TagsInput";
import { http } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { VIEW_PREFERENCE_KEY } from "@/constants";

export type CategoryOption = { id: number; name: string };
export type Video = {
  id: number;
  title: string;
  description?: string;
  amazonLink?: string;
  tags?: string[];
  categoryId?: number;
  thumbnailUrl?: string;
  createdAt?: string;
};
export interface ResponsePagination<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Videos() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [view, setView] = useState<string>(() => localStorage.getItem(VIEW_PREFERENCE_KEY) || "cards");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amazonLink, setAmazonLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = "Videos | TheShopping Admin"; }, []);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    pages.push(1);

    let left = page - delta;
    let right = page + delta;

    if (left > 2) pages.push("...");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };


  const load = async () => {
    try {
      setLoading(true);
      const [videosRes, cats] = await Promise.all([
        http.get<ResponsePagination<Video>>(`/videos?page=${page}&limit=${limit}`),
        http.get<CategoryOption[]>("/categories"),
      ]);
      setItems(Array.isArray(videosRes.data) ? videosRes.data : []);
      setPage(videosRes.page);
      setLimit(videosRes.limit);
      setTotal(videosRes.total);
      setTotalPages(videosRes.totalPages);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter((v) => {
      const inCat = catFilter === "all" || String(v.categoryId ?? "") === catFilter;
      const inQuery = v.title?.toLowerCase().includes(q) || (v.tags || []).some((t) => t.toLowerCase().includes(q));
      return inCat && inQuery;
    });
  }, [items, query, catFilter]);

  const rememberView = (next: string) => { setView(next); localStorage.setItem(VIEW_PREFERENCE_KEY, next); };

  const openCreate = () => {
    setEditing(null);
    setTitle(""); setDescription(""); setAmazonLink(""); setTags([]); setCategoryId(undefined);
    setVideoFile(null); setThumbnailFile(null);
    setMetaTitle(""); setMetaDescription(""); setMetaKeywords([]);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (v: Video) => {
    setEditing(v);
    setTitle(v.title || "");
    setDescription(v.description || "");
    setAmazonLink(v.amazonLink || "");
    setTags(Array.isArray(v.tags) ? v.tags as string[] : []);
    setCategoryId(v.categoryId);
    setVideoFile(null);
    setThumbnailFile(null);
    setMetaTitle((v as any).metaTitle || "");
    setMetaDescription((v as any).metaDescription || "");
    setMetaKeywords(Array.isArray(v.tags) ? v.tags as string[] : []);
    setTimeout(() => {
      setError(null);
      setModalOpen(true);
    }, 400);
  };

  const createValid = title.trim() && description.trim() && amazonLink.trim() && tags.length > 0 && !!categoryId && videoFile && thumbnailFile;

  const onSave = async () => {
    try {

      const appendList = (f: FormData, key: string, arr?: string[]) => {
        (arr || []).forEach(v => f.append(key, v));
      };

      if (!editing && !createValid) {
        setError("Please fill all required fields");
        return;
      }
      setLoading(true);
      if (!editing) {
        setMetaKeywords(tags);
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        form.append("amazonLink", amazonLink);
        appendList(form, "tags", tags);
        form.append("categoryId", String(categoryId));
        if (videoFile) form.append("video", videoFile);
        if (thumbnailFile) form.append("thumbnail", thumbnailFile);
        if (metaTitle) form.append("metaTitle", metaTitle);
        if (metaDescription) form.append("metaDescription", metaDescription);
        if (metaKeywords?.length) appendList(form, "metaKeywords", metaKeywords);
        await http.post(`/videos/upload`, form, { headers: { "Content-Type": "multipart/form-data" } });
        toast({ title: "Created", description: "Video uploaded" });
      } else {
        const hasFiles = !!videoFile || !!thumbnailFile;
        if (hasFiles) {
          const form = new FormData();
          if (title !== editing.title) form.append("title", title);
          if (description !== (editing.description||"")) form.append("description", description);
          if (amazonLink !== (editing.amazonLink||"")) form.append("amazonLink", amazonLink);
          if (JSON.stringify(tags) !== JSON.stringify(editing.tags||[])) appendList(form, "tags", tags);
          if (categoryId !== editing.categoryId) form.append("categoryId", String(categoryId));
          if (videoFile) form.append("video", videoFile);
          if (thumbnailFile) form.append("thumbnail", thumbnailFile);
          if (metaTitle) form.append("metaTitle", metaTitle);
          if (metaDescription) form.append("metaDescription", metaDescription);
          if (metaKeywords.length) appendList(form, "metaKeywords", metaKeywords);
          await http.put(`/videos/${editing.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          const body: any = {};
          if (title !== editing.title) body.title = title;
          if (description !== (editing.description||"")) body.description = description;
          if (amazonLink !== (editing.amazonLink||"")) body.amazonLink = amazonLink;
          if (JSON.stringify(tags) !== JSON.stringify(editing.tags||[])) body.tags = tags;
          if (categoryId !== editing.categoryId) body.categoryId = categoryId;
          if (metaTitle) body.metaTitle = metaTitle;
          if (metaDescription) body.metaDescription = metaDescription;
          if (metaKeywords.length) body.metaKeywords = metaKeywords;
          await http.put(`/videos/${editing.id}`, body);
        }
        toast({ title: "Updated", description: "Video saved" });
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const confirmDelete = (id: number) => { setDeleteId(id); setConfirmOpen(true); };
  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await http.delete(`/videos/${deleteId}`);
      toast({ title: "Deleted", description: "Video removed" });
      setConfirmOpen(false);
      setDeleteId(null);
      await load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Videos</h1>
          <p className="text-sm text-muted-foreground">Manage all videos</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search title or tags" value={query} onChange={(e)=>setQuery(e.target.value)} className="w-64" />
          <Select value={catFilter} onValueChange={(v)=>setCatFilter(v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Filter by category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="rounded-md border p-1">
            <div className="flex">
              <Button variant={view==='cards'? 'default':'secondary'} size="sm" onClick={()=>rememberView('cards')}>Cards</Button>
              <Button variant={view==='table'? 'default':'secondary'} size="sm" onClick={()=>rememberView('table')}>Table</Button>
            </div>
          </div>
          <Button onClick={openCreate}>Add Video</Button>
        </div>
      </header>

      {view === 'table' ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No videos found.</TableCell></TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={`${v.title} thumbnail`} className="h-12 w-20 rounded object-cover border" /> : <div className="h-12 w-20 rounded border bg-muted" />}</TableCell>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell>{categories.find(c=>c.id===v.categoryId)?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">{(v.tags||[]).map(t=> <Badge key={t} variant="secondary">{t}</Badge>)}</div>
                    </TableCell>
                    <TableCell>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(v)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(v.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div>Loading...</div>
          ) : filtered.length === 0 ? (
            <div>No videos found.</div>
          ) : (
            filtered.map((v) => (
              <Card key={v.id}>
                {v.thumbnailUrl && <img src={v.thumbnailUrl} alt={`${v.title} thumbnail`} className="h-40 w-full object-cover" />}
                <CardHeader className="pb-2"><CardTitle className="text-base">{v.title}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="secondary">{categories.find(c=>c.id===v.categoryId)?.name || 'Uncategorized'}</Badge>
                  <div className="flex flex-wrap gap-1">{(v.tags||[]).map(t=> <Badge key={t}>{t}</Badge>)}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(v)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => confirmDelete(v.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ⬇⬇⬇ Pagination panel shu yerda bo‘ladi */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {items.length} of {total} videos
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            « First
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </Button>

          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={idx} className="px-2">…</span>
            ) : (
              <Button
                key={idx}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p as number)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last »
          </Button>
        </div>
      </div>

      {/* Limit select */}
      <div className="mt-2 flex justify-end">
        <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map(l => (
              <SelectItem key={l} value={String(l)}>{l} / page</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Edit Video" : "Add Video"}
        onClose={() => setModalOpen(false)}
        onSubmit={onSave}
        submitLabel={editing ? "Save" : "Create"}
        disabled={!editing && !createValid}
        loading={loading}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amazon Link</label>
              <Input type="url" value={amazonLink} onChange={(e)=>setAmazonLink(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId ? String(categoryId) : undefined} onValueChange={(v)=>setCategoryId(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <TagsInput value={tags} onChange={setTags} placeholder="Type and press Enter" />
            </div>
            <div className="space-y-2">
              <FilePicker value={videoFile} onChange={setVideoFile} accept="video/*" label="Video file" previewType="none" />
            </div>

          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Meta Title</label>
              <Input value={metaTitle} onChange={(e)=>setMetaTitle(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Meta Description</label>
              <Input value={metaDescription} onChange={(e)=>setMetaDescription(e.target.value)} placeholder="Optional" />
            </div>
            {/*<div className="space-y-2">*/}
            {/*  <label className="text-sm font-medium">SEO Meta Keywords</label>*/}
            {/*  <TagsInput value={metaKeywords} onChange={setMetaKeywords} placeholder="keyword + Enter" />*/}
            {/*</div>*/}
            <div className="space-y-2">
              <FilePicker value={thumbnailFile} onChange={setThumbnailFile} accept="image/*" label="Thumbnail" previewType="image" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium">Description</label>
          <WysiwygEditor value={description} onChange={setDescription} placeholder="Write a compelling description..." minHeight={editing ? 280 : 440} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete video?"
        description="This will permanently remove the video."
      />
    </section>
  );
}
