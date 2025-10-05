import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FilePicker from "@/components/common/FilePicker";
import { http } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export type Category = {
  id: number;
  name: string;
  imgUrl?: string;
};

export default function Categories() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [items, setItems] = useState<Category[]>([]);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => { document.title = "Categories | TheShopping Admin"; }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await http.get<Category[]>("/categories");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter(i => i.name.toLowerCase().includes(query.toLowerCase())), [items, query]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setFile(null);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setFile(null);
    setError(null);
    setModalOpen(true);
  };

  const onSave = async () => {
    setError(null);
    setSaveLoading(true);
    try {
      if (!editing && (!name.trim() || !file)) {
        setError("Name and image are required");
        return;
      }
      const form = new FormData();
      if (!editing || (editing && name !== editing.name)) form.append("name", name);
      if (file) form.append("image", file);

      if (editing) {
        await http.put(`/categories/${editing.id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        toast({ title: "Updated", description: "Category saved" });
      } else {
        await http.post(`/categories`, form, { headers: { "Content-Type": "multipart/form-data" } });
        toast({ title: "Created", description: "Category added" });
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

  const confirmDelete = (id: number) => { setDeleteId(id); setConfirmOpen(true); };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await http.delete(`/categories/${deleteId}`);
      toast({ title: "Deleted", description: "Category removed" });
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
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search by name" value={query} onChange={(e)=>setQuery(e.target.value)} className="w-64" />
          <Button onClick={openCreate}>Add Category</Button>
        </div>
      </header>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3}>No categories found. Try adding one.</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.imgUrl ? (
                      <img src={c.imgUrl} alt={`${c.imgUrl} image`} className="h-12 w-12 rounded object-cover border" />
                    ) : (
                      <div className="h-12 w-12 rounded border bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(c.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Edit Category" : "Add Category"}
        onClose={() => setModalOpen(false)}
        onSubmit={onSave}
        submitLabel={editing ? "Save" : "Create"}
        disabled={!editing && (!name.trim() || !file)}
        loading={saveLoading}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </div>
          <FilePicker value={file ?? null} onChange={setFile} accept="image/*" label="Image" />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="Delete category?"
        description="This will permanently remove the category."
      />
    </section>
  );
}
