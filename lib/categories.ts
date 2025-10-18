import type { TransactionCategory, TransactionType } from "./definitions"

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
  "housing",
  "transportation",
  "healthcare_insurance",
  "education_development",
  "entertainment_leisure",
  "personal_care",
  "shopping_personal",
  "shopping_household",
  "family_support",
  "social_gifts",
  "debt_payment",
  "savings_investment",
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
  housing: {
    label: "Nhà ở & Tiện ích",
    description:
      "Tiền thuê, điện, nước, gas, internet, điện thoại, phí quản lý,...",
    type: "expense",
  },
  transportation: {
    label: "Di chuyển",
    description: "Xăng xe, xe bus/grab, bảo dưỡng xe, phí đỗ xe,...",
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
  personal_care: {
    label: "Chăm sóc cá nhân",
    description: "Cắt tóc, làm móng, spa, massage, nhuộm tóc,...",
    type: "expense",
  },
  shopping_personal: {
    label: "Mua sắm cá nhân",
    description: "Quần áo, giày dép, mỹ phẩm, phụ kiện,...",
    type: "expense",
  },
  shopping_household: {
    label: "Đồ gia dụng",
    description:
      "Nồi niêu, bát đĩa, chăn màn, tủ lạnh, tivi, dụng cụ vệ sinh,...",
    type: "expense",
  },
  family_support: {
    label: "Hỗ trợ gia đình",
    description: "Tiền gửi bố mẹ, hỗ trợ anh chị em, người thân,...",
    type: "expense",
  },
  social_gifts: {
    label: "Giao lưu & Quà tặng",
    description: "Đám cưới, ma chay, sinh nhật, quà tặng bạn bè, hội họp,...",
    type: "expense",
  },
  debt_payment: {
    label: "Trả nợ",
    description: "Trả nợ vay ngân hàng, thẻ tín dụng, nợ cá nhân,...",
    type: "expense",
  },
  savings_investment: {
    label: "Tiết kiệm & Đầu tư",
    description:
      "Gửi tiết kiệm, mua chứng khoán, quỹ đầu tư, bất động sản, crypto, quỹ khẩn cấp,...",
    type: "expense",
  },
  other_expense: {
    label: "Chi phí khác",
    description:
      "Sửa chữa đột xuất, phạt nguội, mất mát, chi phí không xác định,...",
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
