import { useEffect, useMemo, useState } from "react";

export type FilePickerProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  previewType?: "image" | "video" | "none";
};

export default function FilePicker({ value, onChange, accept, label, previewType = "image" }: FilePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (value && previewType !== "none") {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value, previewType]);

  const name = useMemo(() => value?.name ?? "", [value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border file:bg-secondary file:px-3 file:py-1 file:text-foreground"
      />
      {name && <p className="text-xs text-muted-foreground">{name}</p>}
      {preview && previewType === "image" && (
        <img src={preview} alt="Selected preview" className="h-24 w-24 rounded-md object-cover border" />
      )}
      {preview && previewType === "video" && (
        <video src={preview} controls className="w-full max-w-md rounded-md border" />
      )}
    </div>
  );
}
