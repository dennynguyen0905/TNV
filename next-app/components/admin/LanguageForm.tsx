"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";
import type { AdminLanguage } from "@/server/mappers/languageMapper";

export type LanguageFormValues = {
  name: string;
  slug: string;
  code: string;
  description: string;
  flagEmoji: string;
  isActive: boolean;
  sortOrder: number;
};

interface LanguageFormProps {
  open: boolean;
  initial: AdminLanguage | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: LanguageFormValues) => void;
}

export function LanguageForm({
  open,
  initial,
  pending,
  error,
  onClose,
  onSubmit,
}: LanguageFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setSlug(initial?.slug ?? "");
    setSlugTouched(Boolean(initial));
    setCode(initial?.code ?? "");
    setDescription(initial?.description ?? "");
    setFlagEmoji(initial?.flagEmoji ?? "");
    setIsActive(initial?.isActive ?? true);
    setSortOrder(initial?.sortOrder ?? 0);
  }, [open, initial]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function submit() {
    onSubmit({
      name,
      slug: slug || slugify(name),
      code,
      description,
      flagEmoji,
      isActive,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Language" : "New Language"}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="English"
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="english"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="en"
          />
          <Input
            label="Flag emoji"
            value={flagEmoji}
            onChange={(e) => setFlagEmoji(e.target.value)}
            placeholder="🇬🇧"
          />
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description shown on public pages"
        />
        <div className="grid grid-cols-2 gap-4 items-end">
          <Input
            label="Sort order"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
          />
          <label className="flex items-center gap-3 text-sm text-n-700 pb-2">
            <button
              type="button"
              onClick={() => setIsActive((a) => !a)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isActive ? "bg-green-500" : "bg-n-200"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
            {isActive ? "Active" : "Inactive"}
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {initial ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
