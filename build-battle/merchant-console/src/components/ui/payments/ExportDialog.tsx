"use client"

import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import {
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
  ExportColumn,
  ExportScope,
  exportFilename,
  exportScopeLabel,
} from "@/lib/csv"
import { Download } from "lucide-react"
import { useState } from "react"

const COLUMN_LABELS: Record<ExportColumn, string> = {
  id: "Payment ID",
  created_at: "Created at (UTC)",
  merchant: "Merchant",
  description: "Description",
  status: "Status",
  method: "Method",
  card_brand: "Card brand",
  last4: "Card last four",
  amount: "Amount",
  currency: "Currency",
}

/**
 * Options for the payments export. This builds a link and nothing else: the
 * file itself is produced by GET /api/payments/export, which validates the
 * columns and runs the full query rather than the page on screen.
 */
export function ExportDialog({
  query,
  status,
  currentTotal,
  allTotal,
}: {
  /** The page's current filter params. */
  query: string
  status: string
  currentTotal: number
  allTotal: number
}) {
  const [columns, setColumns] = useState<ExportColumn[]>([...DEFAULT_EXPORT_COLUMNS])
  const [scope, setScope] = useState<ExportScope>("current")

  const toggle = (column: ExportColumn, checked: boolean) => {
    // Keep the canonical column order whatever order boxes are ticked in.
    setColumns((selected) =>
      EXPORT_COLUMNS.filter((c) => (c === column ? checked : selected.includes(c))),
    )
  }

  const count = scope === "all" ? allTotal : currentTotal
  const filename = exportFilename(new Date(), exportScopeLabel(scope, status))

  const params = new URLSearchParams(query)
  params.delete("page")
  params.set("scope", scope)
  params.set("columns", columns.join(","))
  const href = `/api/payments/export?${params.toString()}`
  const canDownload = columns.length > 0

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="w-full gap-2 py-1.5 sm:w-fit">
          <Download
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Export
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Export payments</DrawerTitle>
          <DrawerDescription>
            Choose what goes in the file before you download it.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Scope
            </legend>
            <div className="mt-2 space-y-2">
              {(
                [
                  ["current", "Current filter", currentTotal],
                  ["all", "All payments", allTotal],
                ] as const
              ).map(([value, label, total]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="radio"
                    name="export-scope"
                    value={value}
                    checked={scope === value}
                    onChange={() => setScope(value)}
                    className="size-4 accent-blue-600"
                  />
                  {label}
                  <span className="text-gray-500">({total.toLocaleString()})</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Columns
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EXPORT_COLUMNS.map((column) => (
                <label
                  key={column}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={columns.includes(column)}
                    onChange={(event) => toggle(column, event.target.checked)}
                    className="size-4 rounded accent-blue-600"
                  />
                  {COLUMN_LABELS[column]}
                </label>
              ))}
            </div>
          </fieldset>

          <div
            className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-900"
            aria-live="polite"
          >
            <p className="font-medium text-gray-900 dark:text-gray-50">
              {count.toLocaleString()} {count === 1 ? "payment" : "payments"} will
              be exported
            </p>
            <p className="mt-1 break-all text-gray-500">{filename}</p>
            {!canDownload && (
              <p className="mt-1 text-red-600 dark:text-red-500">
                Choose at least one column to download.
              </p>
            )}
          </div>
        </DrawerBody>

        <DrawerFooter>
          {canDownload ? (
            <Button className="gap-2" asChild>
              <a href={href}>
                <Download className="-ml-0.5 size-4 shrink-0" aria-hidden="true" />
                Download CSV
              </a>
            </Button>
          ) : (
            <Button className="gap-2" disabled>
              <Download className="-ml-0.5 size-4 shrink-0" aria-hidden="true" />
              Download CSV
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
