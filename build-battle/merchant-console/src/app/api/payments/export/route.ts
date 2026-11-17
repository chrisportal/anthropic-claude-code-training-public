import { parseFilters, selectPayments } from "@/data/queries"
import { PaymentFilters } from "@/data/types"
import {
  exportFilename,
  exportScopeLabel,
  parseExportColumns,
  parseExportScope,
  toCsv,
} from "@/lib/csv"
import { NextRequest, NextResponse } from "next/server"

/**
 * Exports payments as CSV, built here on the server so the file holds every
 * matching row rather than the page on screen.
 *
 * Query params, all validated before use:
 * - the usual filters (status, merchantId, search, from, to, sort, direction)
 * - `scope`: "current" (default) keeps the filters, "all" drops them
 * - `columns`: comma-separated, checked against EXPORT_COLUMNS; omitted means
 *   the defaults, which leave out the card last four
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const parsed = parseExportColumns(params.get("columns"))
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 })
  }

  const scope = parseExportScope(params.get("scope"))
  const filters = parseFilters(params)
  const query: PaymentFilters =
    scope === "all"
      ? { sort: filters.sort, direction: filters.direction }
      : filters

  const rows = selectPayments(query)
  const filename = exportFilename(new Date(), exportScopeLabel(scope, filters.status))

  return new Response(toCsv(rows, parsed.columns), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  })
}
