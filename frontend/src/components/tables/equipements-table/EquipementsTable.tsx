import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react";

import {
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components";
import { equipementStatuts } from "@/data/equipements";

import { creerColonnesEquipements } from "./equipements-columns";
import type { EquipementsTableProps } from "./equipements-table.types";

export function EquipementsTable({
  data,
  categorie = "tous",
  onModifier,
}: EquipementsTableProps) {
  const [search, setSearch] = React.useState("");
  const [statut, setStatut] = React.useState("tous");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 8,
  });

  const filteredData = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((equipement) => {
      const matchQuery =
        !query ||
        [
          equipement.nom,
          equipement.marque,
          equipement.numSerie,
          equipement.type,
        ].some((value) => value.toLowerCase().includes(query));
      const matchStatut = statut === "tous" || equipement.statut === statut;
      const matchCategorie =
        categorie === "tous" || equipement.type === categorie;
      return matchQuery && matchStatut && matchCategorie;
    });
  }, [data, search, statut, categorie]);

  const colonnes = React.useMemo(
    () => creerColonnesEquipements({ onModifier: onModifier ?? (() => {}) }),
    [onModifier],
  );

  const table = useReactTable({
    data: filteredData,
    columns: colonnes,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: true,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = Math.max(1, table.getPageCount());
  const rowCount = table.getFilteredRowModel().rows.length;

  return (
    <Card className="gap-0 py-0">
      {/* Barre d'outils : recherche + filtre par statut */}
      <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Inventaire des équipements
          </h2>
          <p className="text-sm text-muted-foreground">
            Triez, filtrez et retrouvez chaque machine du parc.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher (nom, série, marque…)"
              className="h-9 w-full pl-8 sm:w-60"
            />
          </div>
          <Select
            value={statut}
            onValueChange={(value) => setStatut(String(value))}
          >
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="tous">Tous les statuts</SelectItem>
              {equipementStatuts.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tableau */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={colonnes.length}
                className="h-28 text-center text-muted-foreground"
              >
                Aucun équipement ne correspond à votre recherche.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {rowCount} équipement{rowCount > 1 ? "s" : ""} — page{" "}
          {table.getState().pagination.pageIndex + 1} sur {pageCount}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft />
            <span className="sr-only">Première page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft />
            <span className="sr-only">Page précédente</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight />
            <span className="sr-only">Page suivante</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight />
            <span className="sr-only">Dernière page</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}