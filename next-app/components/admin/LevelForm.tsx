"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AdminLevel } from "@/server/mappers/levelMapper";

export type LevelFormValues = {
  code: string;
  name: string;
  sortOrder: number;
};

interface LevelFormProps {
  open: boolean;
  initial: AdminLevel | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: LevelFormValues) => void;
}

export function LevelForm({
  open,
  initial,
  pending,
  error,
  onClose,
  onSubmit,
}: LevelFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setSortOrder(initial?.sortOrder ?? 0);
  }, [open, initial]);

  function submit() {
    onSubmit({
      code,
      name,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Level" : "New Level"}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="A1"
          />
          <Input
            label="Sort order"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Beginner"
        />

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
