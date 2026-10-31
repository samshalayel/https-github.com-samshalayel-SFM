import "server-only"
import { pool } from "./pool"
import type { QuerySpec, QueryResult } from "./query-builder"

// Who is running the query. Replaces Supabase Row Level Security:
// a normal user only ever sees and touches their own rows.
export type Scope = { userId: string } | { admin: true }

type TableRule =
  | { owner: "user_id" }       // row belongs to users.id in user_id
  | { owner: "project" }       // row belongs to a project the user owns

const TABLES: Record<string, TableRule> = {
  projects: { owner: "user_id" },
  snapshots: { owner: "user_id" },
  api_keys: { owner: "user_id" },
  columns: { owner: "user_id" },
  tasks: { owner: "user_id" },
  project_stages: { owner: "project" },
}

const IDENT = /^[a-z_][a-z0-9_]*$/i

function ident(name: string): string {
  const n = name.trim()
  if (!IDENT.test(n)) throw new Error(`Invalid column name: ${name}`)
  return `"${n}"`
}

function selectList(cols?: string): string {
  if (!cols || cols.trim() === "*") return "*"
  return cols.split(",").map((c) => ident(c)).join(", ")
}

// JSON-encode objects/arrays so pg doesn't turn JS arrays into PG arrays
function enc(v: any): any {
  if (v === undefined) return null
  if (v !== null && typeof v === "object" && !(v instanceof Date)) return JSON.stringify(v)
  return v
}

class Params {
  list: any[] = []
  add(v: any) { this.list.push(v); return `$${this.list.length}` }
}

function buildWhere(spec: QuerySpec, scope: Scope, p: Params, rule: TableRule): string {
  const parts: string[] = []
  for (const [col, op, val] of spec.filters) {
    const c = ident(col)
    switch (op) {
      case "eq": parts.push(val === null ? `${c} IS NULL` : `${c} = ${p.add(val)}`); break
      case "neq": parts.push(val === null ? `${c} IS NOT NULL` : `${c} <> ${p.add(val)}`); break
      case "gt": parts.push(`${c} > ${p.add(val)}`); break
      case "gte": parts.push(`${c} >= ${p.add(val)}`); break
      case "lt": parts.push(`${c} < ${p.add(val)}`); break
      case "lte": parts.push(`${c} <= ${p.add(val)}`); break
      case "in": parts.push(`${c} = ANY(${p.add(Array.isArray(val) ? val : [val])})`); break
      case "is": parts.push(val === null ? `${c} IS NULL` : `${c} IS ${val ? "TRUE" : "FALSE"}`); break
      case "like": parts.push(`${c} LIKE ${p.add(val)}`); break
      case "ilike": parts.push(`${c} ILIKE ${p.add(val)}`); break
      default: throw new Error(`Unsupported filter: ${op}`)
    }
  }
  if ("userId" in scope) {
    if (rule.owner === "user_id") parts.push(`"user_id" = ${p.add(scope.userId)}`)
    else parts.push(`"project_id" IN (SELECT id FROM projects WHERE user_id = ${p.add(scope.userId)})`)
  }
  return parts.length ? ` WHERE ${parts.join(" AND ")}` : ""
}

async function assertProjectsOwned(projectIds: string[], userId: string) {
  const ids = [...new Set(projectIds.filter(Boolean))]
  if (!ids.length) throw new Error("project_id is required")
  const { rows } = await pool.query(
    "SELECT count(*)::int AS n FROM projects WHERE id = ANY($1) AND user_id = $2",
    [ids, userId],
  )
  if (rows[0].n !== ids.length) throw new Error("Project not found")
}

function shape(spec: QuerySpec, rows: any[], wantRows: boolean): QueryResult {
  if (!wantRows) return { data: null, error: null }
  if (spec.single === "single") {
    if (rows.length !== 1)
      return { data: null, error: { message: `Expected 1 row, got ${rows.length}`, code: "PGRST116" } }
    return { data: rows[0], error: null }
  }
  if (spec.single === "maybeSingle") {
    if (rows.length > 1) return { data: null, error: { message: "Multiple rows returned", code: "PGRST116" } }
    return { data: rows[0] ?? null, error: null }
  }
  return { data: rows, error: null }
}

export async function executeQuery(spec: QuerySpec, scope: Scope): Promise<QueryResult> {
  try {
    const rule = TABLES[spec.table]
    if (!rule) throw new Error(`Unknown table: ${spec.table}`)
    const table = ident(spec.table)
    const p = new Params()
    const isUser = "userId" in scope

    if (spec.action === "select") {
      let sql = `SELECT ${selectList(spec.columns)} FROM ${table}` + buildWhere(spec, scope, p, rule)
      if (spec.order.length)
        sql += " ORDER BY " + spec.order.map(([c, asc]) => `${ident(c)} ${asc ? "ASC" : "DESC"}`).join(", ")
      if (spec.limit) sql += ` LIMIT ${Math.max(0, Math.floor(spec.limit))}`
      const { rows } = await pool.query(sql, p.list)
      return shape(spec, rows, true)
    }

    if (spec.action === "insert" || spec.action === "upsert") {
      const rows: any[] = (Array.isArray(spec.values) ? spec.values : [spec.values]).map((r) => ({ ...r }))
      if (!rows.length) return { data: [], error: null }
      if (isUser) {
        if (rule.owner === "user_id") rows.forEach((r) => (r.user_id = scope.userId))
        else await assertProjectsOwned(rows.map((r) => r.project_id), scope.userId)
      }
      const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]
      const colSql = cols.map(ident).join(", ")
      const valuesSql = rows
        .map((r) => "(" + cols.map((c) => (c in r ? p.add(enc(r[c])) : "DEFAULT")).join(", ") + ")")
        .join(", ")
      let sql = `INSERT INTO ${table} (${colSql}) VALUES ${valuesSql}`
      if (spec.action === "upsert") {
        const target = (spec.onConflict || "id").split(",").map(ident).join(", ")
        const updates = cols
          .filter((c) => !(spec.onConflict || "id").split(",").map((x) => x.trim()).includes(c))
          .filter((c) => !(isUser && (c === "user_id" || c === "project_id")))
          .map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`)
        sql += updates.length ? ` ON CONFLICT (${target}) DO UPDATE SET ${updates.join(", ")}` : ` ON CONFLICT (${target}) DO NOTHING`
        // never let an upsert overwrite another user's row
        if (isUser && updates.length) {
          sql += rule.owner === "user_id"
            ? ` WHERE ${table}."user_id" = ${p.add(scope.userId)}`
            : ` WHERE ${table}."project_id" IN (SELECT id FROM projects WHERE user_id = ${p.add(scope.userId)})`
        }
      }
      const wantRows = spec.returning !== undefined
      if (wantRows) sql += ` RETURNING ${selectList(spec.returning)}`
      const { rows: out } = await pool.query(sql, p.list)
      return shape(spec, out, wantRows)
    }

    if (spec.action === "update") {
      const values = { ...(spec.values || {}) }
      if (isUser) { delete values.user_id; delete values.project_id; delete values.id }
      const cols = Object.keys(values)
      if (!cols.length) throw new Error("Nothing to update")
      const set = cols.map((c) => `${ident(c)} = ${p.add(enc(values[c]))}`).join(", ")
      let sql = `UPDATE ${table} SET ${set}` + buildWhere(spec, scope, p, rule)
      const wantRows = spec.returning !== undefined
      if (wantRows) sql += ` RETURNING ${selectList(spec.returning)}`
      const { rows } = await pool.query(sql, p.list)
      return shape(spec, rows, wantRows)
    }

    if (spec.action === "delete") {
      if (!spec.filters.length && !("admin" in scope)) throw new Error("Refusing to delete without a filter")
      let sql = `DELETE FROM ${table}` + buildWhere(spec, scope, p, rule)
      const wantRows = spec.returning !== undefined
      if (wantRows) sql += ` RETURNING ${selectList(spec.returning)}`
      const { rows } = await pool.query(sql, p.list)
      return shape(spec, rows, wantRows)
    }

    throw new Error(`Unsupported action: ${spec.action}`)
  } catch (e: any) {
    return { data: null, error: { message: e?.message || String(e), code: e?.code } }
  }
}
