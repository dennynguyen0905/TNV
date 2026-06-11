"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, SelectInput } from "@/components/ui/Input";
import type { AdminMedia } from "@/server/mappers/mediaMapper";

export type MediaFormValues = {
  type: string;
  url: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string;
  lessonId?: string;
};

const TYPE_OPTIONS = [
  { value: "AUDIO", label: "Audio" },
  { value: "IMAGE", label: "Image" },
  { value: "PDF", label: "PDF" },
  { value: "OTHER", label: "Other" },
];

interface MediaFormProps {
  open: boolean;
  initial: AdminMedia | null;
  lessons: { id: string; title: string }[];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: MediaFormValues) => void;
}

export function MediaForm({
  open,
  initial,
  lessons,
  pending,
  error,
  onClose,
  onSubmit,
}: MediaFormProps) {
  const [type, setType] = useState("AUDIO");
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sizeBytes, setSizeBytes] = useState("");
  const [altText, setAltText] = useState("");
  const [lessonId, setLessonId] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? "AUDIO");
    setUrl(initial?.url ?? "");
    setFilename(initial?.filename ?? "");
    setMimeType(initial?.mimeType ?? "");
    setSizeBytes(initial?.sizeBytes != null ? String(initial.sizeBytes) : "");
    setAltText(initial?.altText ?? "");
    setLessonId(initial?.lessonId ?? "");
  }, [open, initial]);

  function submit() {
    const parsedSize = sizeBytes.trim() === "" ? undefined : parseInt(sizeBytes, 10);
    onSubmit({
      type,
      url,
      filename,
      mimeType: mimeType.trim() || undefined,
      sizeBytes: Number.isFinite(parsedSize) ? parsedSize : undefined,
      altText: altText.trim() || undefined,
      lessonId: lessonId || undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Media" : "New Media"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            id="m-type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={TYPE_OPTIONS}
          />
          <Input
            id="m-mime"
            label="MIME type"
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            placeholder="audio/mpeg"
          />
        </div>
        <Input
          id="m-filename"
          label="Filename / title"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="morning-routine.mp3"
        />
        <Input
          id="m-url"
          label="URL / path"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/audio/morning-routine.mp3"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="m-size"
            label="Size (bytes)"
            type="number"
            min={0}
            value={sizeBytes}
            onChange={(e) => setSizeBytes(e.target.value)}
            placeholder="1200000"
          />
          <SelectInput
            id="m-lesson"
            label="Linked lesson"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            options={[{ value: "", label: "— None —" }, ...lessons.map((l) => ({ value: l.id, label: l.title }))]}
          />
        </div>
        <Textarea
          id="m-alt"
          label="Alt text / description"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          rows={2}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{initial ? "Save" : "Create"}</Button>
        </div>
      </div>
    </Modal>
  );
}
