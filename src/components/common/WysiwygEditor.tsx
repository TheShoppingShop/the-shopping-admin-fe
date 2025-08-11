import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./wysiwyg.css";

export type WysiwygEditorProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number; // in px
};

export default function WysiwygEditor({ value, onChange, placeholder, minHeight = 240 }: WysiwygEditorProps) {
  return (
    <div className="rounded-md border wysiwyg" style={{ ["--wysiwyg-min-h" as any]: `${minHeight}px` }}>
      <ReactQuill theme="snow" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
