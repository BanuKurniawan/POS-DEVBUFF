"use client";

import React, { useState, useTransition } from "react";
import { Plus, FolderTree } from "lucide-react";
import {
  ProductDTO,
  CategoryDTO,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  getCategories,
  ProductInput,
} from "@/app/actions/products";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  ProductStatsBar,
  ProductFilters,
  ProductTable,
  ProductFormModal,
  ProductDeleteModal,
  CategoryManageModal,
  StockFilterType,
} from "@/components/products";

interface ProductsViewProps {
  initialProducts: ProductDTO[];
  initialCategories: CategoryDTO[];
}

export default function ProductsView({
  initialProducts,
  initialCategories,
}: ProductsViewProps) {
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");

  // Modal State Produk
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>("");
  const [formSku, setFormSku] = useState<string>("");
  const [formBarcode, setFormBarcode] = useState<string>("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formUnit, setFormUnit] = useState<string>("pcs");
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  // Modal State Hapus
  const [deletingProduct, setDeletingProduct] = useState<ProductDTO | null>(null);

  // Modal State Kategori
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState<string>("");

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const refreshData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter List Produk
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));

    const matchCategory =
      selectedCategory === "Semua" ||
      p.category === selectedCategory ||
      p.categoryId === selectedCategory;

    let matchStock = true;
    if (stockFilter === "available") matchStock = p.stock > (p.minStock ?? 5);
    if (stockFilter === "low") matchStock = p.stock > 0 && p.stock <= (p.minStock ?? 5);
    if (stockFilter === "out") matchStock = p.stock <= 0;

    return matchSearch && matchCategory && matchStock;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock ?? 5)).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  // Buka Modal Tambah Produk
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSku(`PRD-${Date.now().toString().slice(-5)}`);
    setFormBarcode("");
    setFormPrice(0);
    setFormCostPrice(0);
    setFormStock(10);
    setFormMinStock(5);
    setFormUnit("pcs");
    setFormCategoryId(categories[0]?.id || "");
    setIsProductModalOpen(true);
  };

  // Buka Modal Edit Produk
  const handleOpenEditModal = (p: ProductDTO) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || "");
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStock ?? 5);
    setFormUnit(p.unit);
    setFormCategoryId(p.categoryId || "");
    setIsProductModalOpen(true);
  };

  // Simpan Produk
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showFeedback("Nama produk wajib diisi.", "error");
      return;
    }

    if (formPrice < 0) {
      showFeedback("Harga jual tidak boleh kurang dari 0.", "error");
      return;
    }

    const payload: ProductInput = {
      name: formName.trim(),
      sku: formSku.trim(),
      barcode: formBarcode.trim() || null,
      price: formPrice,
      costPrice: formCostPrice,
      stock: formStock,
      minStock: formMinStock,
      unit: formUnit.trim() || "pcs",
      categoryId: formCategoryId || null,
    };

    startTransition(async () => {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, payload);
        if (res.success) {
          showFeedback(`Produk "${formName}" berhasil diperbarui.`);
          setIsProductModalOpen(false);
          await refreshData();
        } else {
          showFeedback(res.message || "Gagal memperbarui produk.", "error");
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          showFeedback(`Produk "${formName}" berhasil ditambahkan.`);
          setIsProductModalOpen(false);
          await refreshData();
        } else {
          showFeedback(res.message || "Gagal menambahkan produk.", "error");
        }
      }
    });
  };

  // Hapus Produk
  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    startTransition(async () => {
      const res = await deleteProduct(deletingProduct.id);
      if (res.success) {
        showFeedback(`Produk "${deletingProduct.name}" berhasil dihapus.`);
        setDeletingProduct(null);
        await refreshData();
      } else {
        showFeedback(res.message || "Gagal menghapus produk.", "error");
      }
    });
  };

  // Kategori CRUD
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    startTransition(async () => {
      const res = await createCategory(newCatName.trim());
      if (res.success) {
        showFeedback(`Kategori "${newCatName}" berhasil dibuat.`);
        setNewCatName("");
        await refreshData();
      } else {
        showFeedback(res.message || "Gagal membuat kategori.", "error");
      }
    });
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    startTransition(async () => {
      const res = await updateCategory(id, editCatName.trim());
      if (res.success) {
        showFeedback("Nama kategori berhasil diperbarui.");
        setEditingCatId(null);
        setEditCatName("");
        await refreshData();
      } else {
        showFeedback(res.message || "Gagal mengedit kategori.", "error");
      }
    });
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (
      !confirm(
        `Hapus kategori "${name}"? Produk dalam kategori ini akan dialihkan ke kategori Umum.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        showFeedback(`Kategori "${name}" berhasil dihapus.`);
        await refreshData();
      } else {
        showFeedback(res.message || "Gagal menghapus kategori.", "error");
      }
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <Toast
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-border">
        <div>
          <h2 className="text-base font-bold text-text tracking-tight">Katalog Produk Sembako</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Kelola data harga jual, modal, stok fisik, dan batas minimum stok toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            leftIcon={<FolderTree className="w-3.5 h-3.5 text-text-muted" />}
          >
            Kategori
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* KPI / Status Bar */}
      <ProductStatsBar
        totalCount={products.length}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
      />

      {/* Search & Filter Toolbar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
      />

      {/* Main Table */}
      <ProductTable
        products={filteredProducts}
        onEditProduct={handleOpenEditModal}
        onDeleteProduct={setDeletingProduct}
        onResetFilter={() => {
          setSearchQuery("");
          setSelectedCategory("Semua");
          setStockFilter("all");
        }}
      />

      {/* DIALOG: TAMBAH / EDIT PRODUK */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        formName={formName}
        onFormNameChange={setFormName}
        formSku={formSku}
        onFormSkuChange={setFormSku}
        formBarcode={formBarcode}
        onFormBarcodeChange={setFormBarcode}
        formCategoryId={formCategoryId}
        onFormCategoryIdChange={setFormCategoryId}
        categories={categories}
        formUnit={formUnit}
        onFormUnitChange={setFormUnit}
        formCostPrice={formCostPrice}
        onFormCostPriceChange={setFormCostPrice}
        formPrice={formPrice}
        onFormPriceChange={setFormPrice}
        formStock={formStock}
        onFormStockChange={setFormStock}
        formMinStock={formMinStock}
        onFormMinStockChange={setFormMinStock}
        isPending={isPending}
        onSave={handleSaveProduct}
      />

      {/* DIALOG: KONFIRMASI HAPUS PRODUK */}
      <ProductDeleteModal
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        isPending={isPending}
        onConfirmDelete={handleConfirmDeleteProduct}
      />

      {/* DIALOG: KELOLA KATEGORI */}
      <CategoryManageModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        newCatName={newCatName}
        onNewCatNameChange={setNewCatName}
        onCreateCategory={handleCreateCategory}
        editingCatId={editingCatId}
        editCatName={editCatName}
        onStartEdit={(id, name) => {
          setEditingCatId(id);
          setEditCatName(name);
        }}
        onCancelEdit={() => {
          setEditingCatId(null);
          setEditCatName("");
        }}
        onEditCatNameChange={setEditCatName}
        onSaveEdit={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        isPending={isPending}
      />
    </div>
  );
}
