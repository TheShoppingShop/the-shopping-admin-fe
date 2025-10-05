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
import {ThumbnailCell} from '@/components/common/ThumbnailImgModal.tsx'
import TagsInput from "@/components/common/TagsInput";
import { http } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { VIEW_PREFERENCE_KEY } from "@/constants";
import {Textarea} from "@/components/ui/textarea.tsx";
import MultiSelect from "@/components/ui/MultiSelect.tsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination.tsx";

export type CategoryOption = { id: number; name: string };
export type Video = {
  id: number;
  title: string;
  description?: string;
  amazonLink?: string;
  tags?: string[];
  categoryIds?: number[];
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
  const [saveLoading, setSaveLoading] = useState(false);
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
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => categories.map(c => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  useEffect(() => { document.title = "Videos | TheShopping Admin"; }, []);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    pages.push(1);

    const left = page - delta;
    const right = page + delta;

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
      const inCat = catFilter === "all" || (Array.isArray(v.categoryIds) && v.categoryIds.map(String).includes(catFilter));
      const inQuery = v.title?.toLowerCase().includes(q) || (v.tags || []).some((t) => t.toLowerCase().includes(q));
      return inCat && inQuery;
    });
  }, [items, query, catFilter]);

  const rememberView = (next: string) => { setView(next); localStorage.setItem(VIEW_PREFERENCE_KEY, next); };

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setAmazonLink("");
    setTags([]);
    setCategoryIds([]);
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
    setCategoryIds(Array.isArray((v as any).categoryIds) ? (v as any).categoryIds : []);
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

  const createValid = title.trim() && description.trim() && amazonLink.trim() && tags.length > 0 && categoryIds.length > 0 && videoFile && thumbnailFile;

  const onSave = async () => {
    try {

      const appendList = (f: FormData, key: string, arr?: (string|number)[]) => {
        (arr || []).forEach(v => f.append(key, String(v)));
      };

      if (!editing && !createValid) {
        setError("Please fill all required fields");
        return;
      }
      setSaveLoading(true);
      if (!editing) {
        setMetaKeywords(tags);
        const form = new FormData();
        form.append("title", title);
        form.append("description", description);
        form.append("amazonLink", amazonLink);
        appendList(form, "tags", tags);
        appendList(form, "categoryIds", categoryIds);
        if (videoFile) form.append("video", videoFile);
        if (thumbnailFile) form.append("thumbnail", thumbnailFile);
        if (metaTitle) form.append("metaTitle", metaTitle);
        if (metaDescription) form.append("metaDescription", metaDescription);
        if (metaKeywords?.length) appendList(form, "metaKeywords", metaKeywords);
        await http.post(`/videos/upload`, form, { headers: { "Content-Type": "multipart/form-data" } });
        toast({ title: "Created", description: "Video uploaded" });
      } else {
        const form = new FormData();

        if (title !== editing.title) form.append("title", title);
        if (description !== (editing.description || "")) form.append("description", description);
        if (amazonLink !== (editing.amazonLink || "")) form.append("amazonLink", amazonLink);

        if (JSON.stringify(tags) !== JSON.stringify(editing.tags || [])) {
          tags.forEach((t) => form.append("tags", t));
        }

        const prevIds = Array.isArray((editing as any).categoryIds)
          ? (editing as any).categoryIds
          : [];
        if (JSON.stringify(prevIds) !== JSON.stringify(categoryIds)) {
          categoryIds.forEach((id) => form.append("categoryIds", String(id)));
        }

        if (metaTitle) form.append("metaTitle", metaTitle);
        if (metaDescription) form.append("metaDescription", metaDescription);
        if (metaKeywords.length) metaKeywords.forEach((kw) => form.append("metaKeywords", kw));

        if (videoFile) form.append("video", videoFile);
        if (thumbnailFile) form.append("thumbnail", thumbnailFile);

        await http.put(`/videos/${editing.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast({ title: "Updated", description: "Video saved" });
        toast({ title: "Updated", description: "Video saved" });
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Error", description: e.message });
    } finally {
      setSaveLoading(false);
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

  useEffect(() => {
    load();
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // sahifalarni ko‘rsatish uchun helper
  const getVisiblePages = () => {
    const delta = 1;
    const pages: (number | string)[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
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
                    {/*<TableCell>{v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={`${v.title} thumbnail`} className="h-12 w-20 rounded object-cover border" /> : <div className="h-12 w-20 rounded border bg-muted" />}</TableCell>*/}
                    <TableCell>
                      <ThumbnailCell v={v} />
                    </TableCell>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell>
                      {Array.isArray(v.categoryIds) && v.categoryIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {v.categoryIds.map(cid => {
                            const c = categories.find(cc => cc.id === cid)
                            return <Badge key={cid} variant="secondary">{c?.name ?? cid}</Badge>
                          })}
                        </div>
                      ) : ('-')}
                    </TableCell>
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
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(v.categoryIds) && v.categoryIds.length > 0 ? (
                      v.categoryIds.map(cid => {
                        const c = categories.find(cc => cc.id === cid)
                        return <Badge key={cid} variant="secondary">{c?.name ?? cid}</Badge>
                      })
                    ) : (
                      <Badge variant="outline">Uncategorized</Badge>
                    )}
                  </div>
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

        <Pagination className="mt-4">
          <PaginationContent>
            {/* Previous button */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Page numbers */}
            {getVisiblePages().map((p, i) =>
              p === "..." ? (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={i} className="cursor-pointer">
                  <PaginationLink
                    isActive={page === p}
                    onClick={() => handlePageChange(p as number)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            {/* Next button */}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
        loading={saveLoading}
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
              <MultiSelect
                options={categories.map(c => ({ id: c.id, name: c.name }))}
                value={categoryIds}
                onChange={setCategoryIds}
              />
              {/*<Select value={categoryId ? String(categoryId) : undefined} onValueChange={(v)=>setCategoryId(Number(v))}>*/}
              {/*  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>*/}
              {/*  <SelectContent>*/}
              {/*    {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}*/}
              {/*  </SelectContent>*/}
              {/*</Select>*/}
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
          {/*<WysiwygEditor value={description} onChange={setDescription} placeholder="Write a compelling description..." minHeight={editing ? 280 : 440} />*/}
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write a compelling description..." rows={10} />
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
