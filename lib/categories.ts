import type {
  CustomCategory,
  TransactionCategoryKey,
  TransactionType,
} from "@/lib/definitions"

export const TRANSACTION_TYPES = ["income", "expense"] as const

export const INCOME_CATEGORIES = [
  "salary_bonus",
  "business_freelance",
  "investment_passive",
  "gift_support",
  "other_income",
] as const

export const EXPENSE_CATEGORIES = [
  "food_beverage",
  "transportation",
  "personal_care",
  "shopping",
  "family_support",
  "housing",
  "healthcare_insurance",
  "education_development",
  "entertainment_leisure",
  "social_gifts",
  "savings_investment",
  "debt_payment",
  "other_expense",
] as const

export const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const

type CategoryConfigType = {
  [K in (typeof ALL_CATEGORIES)[number]]: {
    label: string
    description: string
    type: (typeof TRANSACTION_TYPES)[number]
  }
}

export const CATEGORY_CONFIG: CategoryConfigType = {
  // Incomes
  salary_bonus: {
    label: "Lương & Thưởng",
    description:
      "Lương chính, thưởng hiệu suất, thưởng lễ tết, thu nhập phụ cấp,...",
    type: "income",
  },
  business_freelance: {
    label: "Kinh doanh & Freelance",
    description:
      "Doanh thu bán hàng, dịch vụ, freelance, hợp đồng ngắn hạn,...",
    type: "income",
  },
  investment_passive: {
    label: "Đầu tư & Thu nhập thụ động",
    description:
      "Lãi tiết kiệm, cổ tức, lãi trái phiếu, cho thuê, bản quyền,...",
    type: "income",
  },
  gift_support: {
    label: "Quà tặng & Hỗ trợ",
    description: "Quà tặng tiền mặt, hỗ trợ từ gia đình, tiền mừng,...",
    type: "income",
  },
  other_income: {
    label: "Thu nhập khác",
    description: "Tiền hoàn trả, bán đồ cũ, giải thưởng, các khoản bất ngờ,...",
    type: "income",
  },
  // Expenses
  food_beverage: {
    label: "Ăn uống",
    description: "Siêu thị, chợ, nhà hàng, café, đồ ăn sáng/trưa/tối,...",
    type: "expense",
  },
  transportation: {
    label: "Di chuyển",
    description: "Xăng xe, xe bus/grab, bảo dưỡng xe, phí đỗ xe,...",
    type: "expense",
  },
  personal_care: {
    label: "Chăm sóc",
    description: "Cắt tóc, làm móng, spa, massage, nhuộm tóc, chăm sóc da,...",
    type: "expense",
  },
  shopping: {
    label: "Mua sắm",
    description:
      "Quần áo, giày dép, mỹ phẩm, phụ kiện, đồ điện tử, đồ gia dụng,...",
    type: "expense",
  },
  family_support: {
    label: "Hỗ trợ gia đình",
    description: "Tiền gửi bố mẹ, hỗ trợ anh chị em, người thân,...",
    type: "expense",
  },
  housing: {
    label: "Nhà ở & Tiện ích",
    description:
      "Tiền thuê, điện, nước, gas, internet, điện thoại, phí quản lý,...",
    type: "expense",
  },
  healthcare_insurance: {
    label: "Y tế & Bảo hiểm",
    description: "Khám chữa bệnh, thuốc men, bảo hiểm y tế/nhân thọ,...",
    type: "expense",
  },
  education_development: {
    label: "Giáo dục & Phát triển",
    description:
      "Học phí, sách vở, khóa học online/offline, chứng chỉ, hội thảo,...",
    type: "expense",
  },
  entertainment_leisure: {
    label: "Giải trí & Thư giãn",
    description: "Du lịch, phim ảnh, âm nhạc, game, gym, sở thích,...",
    type: "expense",
  },
  social_gifts: {
    label: "Giao lưu & Quà tặng",
    description: "Đám cưới, ma chay, sinh nhật, quà tặng bạn bè, hội họp,...",
    type: "expense",
  },
  savings_investment: {
    label: "Tiết kiệm & Đầu tư",
    description:
      "Gửi tiết kiệm, mua chứng khoán, quỹ đầu tư, bất động sản, crypto, quỹ khẩn cấp,...",
    type: "expense",
  },
  debt_payment: {
    label: "Trả nợ",
    description: "Trả nợ vay ngân hàng, thẻ tín dụng, nợ cá nhân,...",
    type: "expense",
  },
  other_expense: {
    label: "Chi phí khác",
    description:
      "Sửa chữa đột xuất, phạt nguội, mất mát, chi phí không xác định,...",
    type: "expense",
  },
} as const

interface CategoryDetail {
  label: string
  description: string
  categoryKey: TransactionCategoryKey
}

export function getCategoriesWithDetails(
  type: TransactionType
): CategoryDetail[] {
  return Object.entries(CATEGORY_CONFIG)
    .filter(([_, config]) => config.type === type)
    .map(([categoryKey, config]) => ({
      label: config.label,
      description: config.description,
      categoryKey: categoryKey as TransactionCategoryKey,
    }))
}

export function getCategoryProperty(
  categoryKey: TransactionCategoryKey,
  property: "label" | "description",
  customCategories?: CustomCategory[]
): string {
  if (categoryKey in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG][
      property
    ]
  }
  return (
    customCategories?.find((c) => c.categoryKey === categoryKey)?.[property] ||
    ""
  )
}

export function getCategoryLabel(
  categoryKey: TransactionCategoryKey,
  customCategories?: CustomCategory[]
): string {
  return getCategoryProperty(categoryKey, "label", customCategories)
}

export function getCategoryDescription(
  categoryKey: TransactionCategoryKey,
  customCategories?: CustomCategory[]
): string {
  return getCategoryProperty(categoryKey, "description", customCategories)
}
