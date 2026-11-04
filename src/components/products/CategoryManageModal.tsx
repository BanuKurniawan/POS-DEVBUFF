import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CategoryDTO } from "@/types";

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
  newCatName: string;
  onNewCatNameChange: (val: string) => void;
  onCreateCategory: (e: React.FormEvent) => void;
  editingCatId: string | null;
  editCatName: string;
  onStartEdit: (id: string, name: string) => void;
  onCancelEdit: () => void;
  onEditCatNameChange: (val: string) => void;
  onSaveEdit: (id: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  isPending: boolean;
}

export const CategoryManageModal: React.FC<CategoryManageModalProps> = ({
  isOpen,
  onClose,
  categories,
  newCatName,
  onNewCatNameChange,
  onCreateCategory,
  editingCatId,
  editCatName,
  onStartEdit,
  onCancelEdit,
  onEditCatNameChange,
  onSaveEdit,
  onDeleteCategory,
  isPending,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Kategori Produk"
      description="Tambah, ubah nama, atau hapus kategori barang sembako."
      maxWidth="md"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Selesai
        </Button>
      }
    >
      <div className="space-y-4">
        <form onSubmit={onCreateCategory} className="flex gap-2">
          <Input
            placeholder="Nama kategori baru..."
            value={newCatName}
            onChange={(e) => onNewCatNameChange(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!newCatName.trim() || isPending}
          >
            Tambah
          </Button>
        </form>

        <div className="divide-y divide-border border border-border rounded-md max-h-64 overflow-y-auto">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-2.5 flex items-center justify-between gap-2 hover:bg-surface-subtle transition-colors text-xs"
            >
              {editingCatId === c.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editCatName}
                    onChange={(e) => onEditCatNameChange(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onSaveEdit(c.id)}
                    disabled={isPending}
                  >
                    Simpan
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onCancelEdit}
                    disabled={isPending}
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text">{c.name}</span>
                    <span className="text-[10px] text-text-muted bg-surface-subtle border border-border px-1.5 py-0.2 rounded font-mono">
                      {c.productCount ?? 0} produk
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onStartEdit(c.id, c.name)}
                      className="p-1 text-text-muted hover:text-text rounded-sm"
                      title="Edit nama kategori"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {c.name !== "Umum" && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(c.id, c.name)}
                        className="p-1 text-text-muted hover:text-negative rounded-sm"
                        title="Hapus kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};

