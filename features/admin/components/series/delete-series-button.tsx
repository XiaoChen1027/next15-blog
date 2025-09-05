"use client";

import * as React from "react";

import { LoaderCircle, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

interface DeleteSeriesButtonProps {
  id: string;
  title?: string;
  refreshAsync?: () => Promise<unknown>;
}

export const DeleteSeriesButton = ({
  id,
  title,
  refreshAsync,
}: DeleteSeriesButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size={"icon"}
          variant="outline"
          onClick={() => setOpen(true)}
          aria-label="删除系列"
          title="删除系列"
        >
          <Trash className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除系列</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除系列{title ? ` “${title}”` : ""}吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button onClick={handleDelete} disabled={loading}>
            {loading && <LoaderCircle className="mr-2 size-4 animate-spin" />}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      showSuccessToast("系列已删除");
      setOpen(false);
      await refreshAsync?.();
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : "删除失败");
    } finally {
      setLoading(false);
    }
  }
};
