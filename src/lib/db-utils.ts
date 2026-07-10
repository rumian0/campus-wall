function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

export function mapRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(row)) {
    result[toCamelCase(key)] = row[key]
  }
  return result
}

export function mapRows<T extends Record<string, unknown>>(rows: T[]): Record<string, unknown>[] {
  return rows.map(mapRow<T>)
}
