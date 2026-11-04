import React, { useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StoreLogoUploaderProps {
  logoPreview: string;
  isOwner: boolean;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
}

export const StoreLogoUploader: React.FC<StoreLogoUploaderProps> = ({
  logoPreview,
  isOwner,
  isUploading,
  onFileChange,
  onRemoveLogo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-surface rounded-md border border-border p-4 space-y-3">
      <div className="pb-2 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-text flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-text-muted" />
            <span>Logo Toko</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Tampil di sidebar aplikasi dan struk kasir.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-20 h-20 rounded-md border border-border bg-surface-subtle flex items-center justify-center p-2 relative overflow-hidden shrink-0">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo Toko"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              unoptimized
            />
          ) : (
            <span className="text-xs text-text-muted text-center font-mono font-medium">
              Tidak Ada Logo
            </span>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={!isOwner || isUploading}
          />
          <p className="text-[11px] text-text-muted">
            Format: PNG, JPG, WebP, SVG (Maks. 5 MB)
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!isOwner || isUploading}
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Pilih Logo
            </Button>
            {logoPreview && isOwner && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveLogo}
                className="text-negative hover:bg-negative-bg"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Hapus
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

