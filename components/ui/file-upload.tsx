"use client";

import * as React from "react";
import { ImageUp } from "lucide-react";

import { cn } from "@/lib/utils";

type FileUploadProps = {
  accept?: string;
  maxSizeBytes?: number;
  onFileSelected: (file: File | null) => void;
  onError?: (message: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

const DEFAULT_ACCEPT = "image/jpeg,image/png";
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Alvo de clique/arraste para upload de arquivo — só valida tipo/tamanho no
 * client e devolve o File via onFileSelected. Não faz upload nenhum (fica a
 * cargo de quem consome, normalmente depois que o registro pai já existe).
 */
function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  onFileSelected,
  onError,
  className,
  disabled,
  children,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const acceptedTypes = React.useMemo(
    () => accept.split(",").map((type) => type.trim()),
    [accept],
  );

  function validateAndSelect(file: File | undefined | null) {
    if (!file) {
      onFileSelected(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      onError?.("Formato não suportado. Envie um arquivo JPG ou PNG.");
      return;
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      onError?.(`Arquivo muito grande. O tamanho máximo é ${maxMb}MB.`);
      return;
    }

    onFileSelected(file);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (!disabled) validateAndSelect(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-line bg-surface px-[24px] py-[32px] text-center outline-none",
        "transition-colors duration-base ease-standard",
        "hover:border-brand hover:bg-brand-tint",
        "focus-visible:border-brand focus-visible:shadow-[0_0_0_var(--focus-ring-inner)_var(--brand-tint)]",
        isDragOver && "border-brand bg-brand-tint",
        disabled && "cursor-not-allowed opacity-50 hover:border-line hover:bg-surface",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
      />
      {children ?? (
        <>
          <ImageUp size={24} strokeWidth={2} className="text-muted" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">
            Clique ou arraste uma foto
          </p>
          <p className="text-[12.5px] text-muted">JPG ou PNG, até 5MB</p>
        </>
      )}
    </div>
  );
}

export { FileUpload };
