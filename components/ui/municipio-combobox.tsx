"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/ui/input";
import { getMunicipios, type Municipio } from "@/lib/municipios";

type MunicipioComboboxProps = {
  value?: string;
  onChange: (nome: string) => void;
  onSelectMunicipio?: (municipio: Municipio) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  "aria-invalid"?: boolean;
};

/**
 * Campo de busca de município (base do IBGE) — ao selecionar um resultado,
 * `onSelectMunicipio` devolve a UF junto, pra quem usa preencher o campo
 * irmão. Digitar sem selecionar continua funcionando como texto livre: se a
 * lista do IBGE falhar ao carregar, o campo não trava o formulário.
 */
const MunicipioCombobox = React.forwardRef<HTMLInputElement, MunicipioComboboxProps>(
  function MunicipioCombobox(
    { value, onChange, onSelectMunicipio, disabled, placeholder, id, name, className, ...props },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);
    const [municipios, setMunicipios] = React.useState<Municipio[] | null>(null);
    const [loading, setLoading] = React.useState(false);

    const carregarMunicipios = React.useCallback(() => {
      if (municipios || loading) return;
      setLoading(true);
      getMunicipios()
        .then(setMunicipios)
        // Não seta `[]`: deixa `municipios` null pra próximo foco tentar de novo
        // em vez de desistir de vez por causa de uma falha de rede pontual.
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [municipios, loading]);

    const termo = value
      ?.normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();

    const resultados = React.useMemo(() => {
      if (!municipios || !termo || termo.length < 2) return [];
      return municipios.filter((m) => m.nomeBusca.includes(termo)).slice(0, 8);
    }, [municipios, termo]);

    return (
      <PopoverPrimitive.Root open={open && resultados.length > 0}>
        <PopoverPrimitive.Anchor asChild>
          <input
            ref={ref}
            id={id}
            name={name}
            value={value ?? ""}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            data-slot="input"
            className={cn(inputVariants, className)}
            onFocus={() => {
              carregarMunicipios();
              setOpen(true);
            }}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            onBlur={() => setOpen(false)}
            {...props}
          />
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            className={cn(
              "z-50 max-h-[240px] min-w-[var(--radix-popover-trigger-width)] overflow-auto rounded-md border border-line bg-surface p-1 text-ink shadow-md outline-none",
              "duration-base ease-standard data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            )}
          >
            {resultados.map((municipio) => (
              <button
                key={`${municipio.nome}-${municipio.uf}`}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-[12px] py-1 text-left text-[13.5px] font-medium outline-none transition-colors duration-fast ease-standard hover:bg-brand-tint focus:bg-brand-tint"
                // onMouseDown (não onClick) dispara antes do blur do input, que fecha o popover
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(municipio.nome);
                  onSelectMunicipio?.(municipio);
                  setOpen(false);
                }}
              >
                <span>{municipio.nome}</span>
                <span className="text-muted">{municipio.uf}</span>
              </button>
            ))}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

export { MunicipioCombobox };
