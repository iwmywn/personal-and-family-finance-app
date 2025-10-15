import type { TransactionCategory, TransactionType } from "./definitions"

export const TRANSACTION_TYPES = ["income", "expense"] as const

const INCOME_CATEGORIES = [
  "salary_bonus",
  "business_sales",
  "investment",
  "other_income",
] as const

const EXPENSE_CATEGORIES = [
  "essential",
  "education_development",
  "entertainment_shopping",
  "family_social",
  "personal_finance",
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

const CATEGORY_CONFIG: CategoryConfigType = {
  // Income categories
  salary_bonus: {
    label: "Lương & Thưởng",
    description: "Lương chính, thưởng hiệu suất, thưởng lễ tết",
    type: "income",
  },
  business_sales: {
    label: "Kinh doanh / Bán hàng",
    description: "Doanh thu bán hàng, dịch vụ, freelance",
    type: "income",
  },
  investment: {
    label: "Đầu tư",
    description:
      "Lãi tiết kiệm ngân hàng, cổ tức, chứng khoán, bất động sản cho thuê",
    type: "income",
  },
  other_income: {
    label: "Thu nhập khác",
    description:
      "Quà tặng, hỗ trợ gia đình, tiền hoàn trả, bán đồ cũ, giải thưởng",
    type: "income",
  },
  // Expense categories
  essential: {
    label: "Nhu cầu thiết yếu",
    description:
      "Ăn uống, nhà ở (thuê nhà, điện nước), đi lại (xăng, xe bus), y tế & bảo hiểm",
    type: "expense",
  },
  education_development: {
    label: "Giáo dục & Phát triển",
    description: "Học phí, sách vở, khóa học, kỹ năng",
    type: "expense",
  },
  entertainment_shopping: {
    label: "Giải trí & Mua sắm",
    description: "Mua sắm cá nhân, du lịch, phim nhạc, game, hội họp bạn bè",
    type: "expense",
  },
  family_social: {
    label: "Gia đình & Xã hội",
    description:
      "Tiền gửi gia đình, hỗ trợ người thân, quà tặng, đám cưới, ma chay",
    type: "expense",
  },
  personal_finance: {
    label: "Tài chính cá nhân",
    description: "Trả nợ (vay, thẻ tín dụng), đầu tư lại, dự phòng khẩn cấp",
    type: "expense",
  },
  other_expense: {
    label: "Chi phí khác",
    description: "Các khoản bất ngờ (mất đồ, sửa chữa, phạt)",
    type: "expense",
  },
} as const

export function getCategoriesByType(type: TransactionType) {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function getCategoryLabel(category: TransactionCategory) {
  return CATEGORY_CONFIG[category].label
}

export function getCategoryDescription(category: TransactionCategory) {
  return CATEGORY_CONFIG[category].description
}
