export type ClassValue = string | false | null | undefined

export const cn = (...values: ClassValue[]): string =>
  values.filter((value): value is string => Boolean(value)).join(' ')
