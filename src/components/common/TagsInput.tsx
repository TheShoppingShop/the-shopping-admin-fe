import { X } from "lucide-react";
import { useState, KeyboardEvent, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [input, setInput] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    const next = Array.from(new Set([...value, t]));
    onChange(next);
    setInput("");
    ref.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  return (
    <div className="flex flex-wrap gap-2 rounded-md border bg-background p-2">
      {value.map((t) => (
        <Badge key={t} variant="secondary" className="gap-1">
          {t}
          <button type="button" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        ref={ref}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 min-w-[8rem]"
      />
    </div>
  );
}
