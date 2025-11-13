import { getTranslations } from "next-intl/server"

import {
  createCategoryConfig,
  getDescription,
  getDetails,
  getLabel,
} from "@/lib/categories"
import { type Category } from "@/lib/definitions"

let CATEGORY_CONFIG: ReturnType<typeof createCategoryConfig>

describe("Categories", () => {
  beforeAll(async () => {
    const t = await getTranslations()
    CATEGORY_CONFIG = createCategoryConfig(t)
  })

  describe("getDetails", () => {
    it("should return income categories", () => {
      const result = getDetails("income", CATEGORY_CONFIG)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((cat) => cat.categoryKey)).toBe(true)
      expect(result.every((cat) => cat.label)).toBe(true)
      expect(result.every((cat) => cat.description)).toBe(true)
    })

    it("should return expense categories", () => {
      const result = getDetails("expense", CATEGORY_CONFIG)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((cat) => cat.categoryKey)).toBe(true)
      expect(result.every((cat) => cat.label)).toBe(true)
      expect(result.every((cat) => cat.description)).toBe(true)
    })
  })

  describe("getLabel", () => {
    it("should return label for valid income category key", () => {
      const result = getLabel("salary_bonus", CATEGORY_CONFIG)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should return label for valid expense category key", () => {
      const result = getLabel("food_beverage", CATEGORY_CONFIG)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should return empty string for invalid category key", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getLabel("invalid" as any, CATEGORY_CONFIG)
      expect(result).toBe("")
    })

    it("should return custom category label when provided", () => {
      const customCategories: Category[] = [
        {
          _id: "1",
          userId: "user1",
          categoryKey: "custom_income_test",
          type: "income",
          label: "Custom Income",
          description: "Custom income category",
        },
      ]
      const result = getLabel(
        "custom_income_test",
        CATEGORY_CONFIG,
        customCategories
      )
      expect(result).toBe("Custom Income")
    })

    it("should return empty string for custom category not found", () => {
      const customCategories: Category[] = []
      const result = getLabel(
        "custom_income_test",
        CATEGORY_CONFIG,
        customCategories
      )
      expect(result).toBe("")
    })
  })

  describe("getDescription", () => {
    it("should return description for valid income category key", () => {
      const result = getDescription("salary_bonus", CATEGORY_CONFIG)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should return description for valid expense category key", () => {
      const result = getDescription("food_beverage", CATEGORY_CONFIG)
      expect(typeof result).toBe("string")
      expect(result.length).toBeGreaterThan(0)
    })

    it("should return empty string for invalid category key", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getDescription("invalid" as any, CATEGORY_CONFIG)
      expect(result).toBe("")
    })

    it("should return custom category description when provided", () => {
      const customCategories: Category[] = [
        {
          _id: "1",
          userId: "user1",
          categoryKey: "custom_income_test",
          type: "income",
          label: "Custom Income",
          description: "Custom income category description",
        },
      ]
      const result = getDescription(
        "custom_income_test",
        CATEGORY_CONFIG,
        customCategories
      )
      expect(result).toBe("Custom income category description")
    })

    it("should return empty string for custom category not found", () => {
      const customCategories: Category[] = []
      const result = getDescription(
        "custom_income_test",
        CATEGORY_CONFIG,
        customCategories
      )
      expect(result).toBe("")
    })
  })
})
