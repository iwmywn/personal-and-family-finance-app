import { mockCategoryConfig } from "@/tests/shared/data"
import {
  getCategoriesWithDetails,
  getCategoryDescription,
  getCategoryLabel,
} from "@/lib/categories"
import { CustomCategory } from "@/lib/definitions"

vi.mock("@/lib/categories", () => ({
  CATEGORY_CONFIG: mockCategoryConfig,
}))

describe("Category Helpers", () => {
  describe("getCategoriesWithDetails", () => {
    it("should return income categories", () => {
      const result = getCategoriesWithDetails("income")
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((cat) => cat.categoryKey)).toBe(true)
      expect(result.every((cat) => cat.label)).toBe(true)
      expect(result.every((cat) => cat.description)).toBe(true)
    })

    it("should return expense categories", () => {
      const result = getCategoriesWithDetails("expense")
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((cat) => cat.categoryKey)).toBe(true)
      expect(result.every((cat) => cat.label)).toBe(true)
      expect(result.every((cat) => cat.description)).toBe(true)
    })
  })

  describe("getCategoryLabel", () => {
    it("should return label for valid income category key", () => {
      const result = getCategoryLabel("salary_bonus")
      expect(result).toBe("Lương & Thưởng")
    })

    it("should return label for valid expense category key", () => {
      const result = getCategoryLabel("food_beverage")
      expect(result).toBe("Ăn uống")
    })

    it("should return empty string for invalid category key", () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const result = getCategoryLabel("invalid" as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */
      expect(result).toBe("")
    })

    it("should return custom category label when provided", () => {
      const customCategories: CustomCategory[] = [
        {
          _id: "1",
          userId: "user1",
          categoryKey: "custom_income_test",
          type: "income" as const,
          label: "Custom Income",
          description: "Custom income category",
        },
      ]
      const result = getCategoryLabel("custom_income_test", customCategories)
      expect(result).toBe("Custom Income")
    })

    it("should return empty string for custom category not found", () => {
      const customCategories: CustomCategory[] = []
      const result = getCategoryLabel("custom_income_test", customCategories)
      expect(result).toBe("")
    })
  })

  describe("getCategoryDescription", () => {
    it("should return description for valid income category key", () => {
      const result = getCategoryDescription("salary_bonus")
      expect(result).toBe(
        "Lương chính, thưởng hiệu suất, thưởng lễ tết, thu nhập phụ cấp,..."
      )
    })

    it("should return description for valid expense category key", () => {
      const result = getCategoryDescription("food_beverage")
      expect(result).toBe(
        "Siêu thị, chợ, nhà hàng, café, đồ ăn sáng/trưa/tối,..."
      )
    })

    it("should return empty string for invalid category key", () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const result = getCategoryDescription("invalid" as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */
      expect(result).toBe("")
    })

    it("should return custom category description when provided", () => {
      const customCategories: CustomCategory[] = [
        {
          _id: "1",
          userId: "user1",
          categoryKey: "custom_income_test",
          type: "income" as const,
          label: "Custom Income",
          description: "Custom income category description",
        },
      ]
      const result = getCategoryDescription(
        "custom_income_test",
        customCategories
      )
      expect(result).toBe("Custom income category description")
    })

    it("should return empty string for custom category not found", () => {
      const customCategories: CustomCategory[] = []
      const result = getCategoryDescription(
        "custom_income_test",
        customCategories
      )
      expect(result).toBe("")
    })
  })
})
