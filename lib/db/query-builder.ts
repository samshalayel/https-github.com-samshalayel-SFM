// A small, Supabase-compatible query builder.
// It only records what the caller asked for (a "QuerySpec"); a runner decides
// where it executes: the browser POSTs it to /api/db, the server runs it
// directly against Postgres. Call sites keep the familiar
//   supabase.from("projects").select("*").eq("user_id", id).order(...)
// shape, so components did not need rewriting.

export type FilterOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "is" | "like" | "ilike"

export interface QuerySpec {
  table: string
  action: "select" | "insert" | "update" | "upsert" | "delete"
  columns?: string          // select list, e.g. "*" or "id, name"
  returning?: string        // columns to return after a write (.select() after insert/update)
  values?: any              // row or rows for insert/update/upsert
  onConflict?: string
  filters: [string, FilterOp, any][]
  order: [string, boolean][] // [column, ascending]
  limit?: number
  single?: "single" | "maybeSingle"
  count?: boolean
}

export interface QueryResult<T = any> {
  data: T | null
  error: { message: string; code?: string } | null
  count?: number | null
}

export type Runner = (spec: QuerySpec) => Promise<QueryResult>

export class QueryBuilder<T = any> implements PromiseLike<QueryResult<T>> {
  private spec: QuerySpec

  constructor(table: string, private run: Runner) {
    this.spec = { table, action: "select", columns: "*", filters: [], order: [] }
  }

  select(columns = "*", opts?: { count?: "exact"; head?: boolean }) {
    if (this.spec.action === "select") this.spec.columns = columns
    else this.spec.returning = columns
    if (opts?.count) this.spec.count = true
    return this
  }
  insert(values: any) { this.spec.action = "insert"; this.spec.values = values; return this }
  upsert(values: any, opts?: { onConflict?: string }) {
    this.spec.action = "upsert"; this.spec.values = values; this.spec.onConflict = opts?.onConflict; return this
  }
  update(values: any) { this.spec.action = "update"; this.spec.values = values; return this }
  delete() { this.spec.action = "delete"; return this }

  private f(col: string, op: FilterOp, val: any) { this.spec.filters.push([col, op, val]); return this }
  eq(c: string, v: any) { return this.f(c, "eq", v) }
  neq(c: string, v: any) { return this.f(c, "neq", v) }
  gt(c: string, v: any) { return this.f(c, "gt", v) }
  gte(c: string, v: any) { return this.f(c, "gte", v) }
  lt(c: string, v: any) { return this.f(c, "lt", v) }
  lte(c: string, v: any) { return this.f(c, "lte", v) }
  in(c: string, v: any[]) { return this.f(c, "in", v) }
  is(c: string, v: null | boolean) { return this.f(c, "is", v) }
  like(c: string, v: string) { return this.f(c, "like", v) }
  ilike(c: string, v: string) { return this.f(c, "ilike", v) }
  match(obj: Record<string, any>) { for (const [k, v] of Object.entries(obj)) this.eq(k, v); return this }

  order(column: string, opts?: { ascending?: boolean }) {
    this.spec.order.push([column, opts?.ascending !== false]); return this
  }
  limit(n: number) { this.spec.limit = n; return this }
  single() { this.spec.single = "single"; return this }
  maybeSingle() { this.spec.single = "maybeSingle"; return this }

  then<A = QueryResult<T>, B = never>(
    onfulfilled?: ((value: QueryResult<T>) => A | PromiseLike<A>) | null,
    onrejected?: ((reason: any) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return this.run(this.spec).then(onfulfilled as any, onrejected)
  }
}
