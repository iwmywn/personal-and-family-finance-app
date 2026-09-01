import { createParser } from "nuqs"

export const parseAsLocalDate = createParser({
  parse: (queryValue: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(queryValue)) return null
    const [year, month, day] = queryValue.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null
    }
    return date
  },
  serialize: (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },
  eq: (a: Date, b: Date) => a.getTime() === b.getTime(),
})
