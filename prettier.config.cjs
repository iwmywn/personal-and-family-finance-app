/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  semi: false,
  trailingComma: "es5",
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/tests/(.*)$",
    "^@/actions/(.*)$",
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",
    "^@/context/(.*)$",
    "^@/env/(.*)$",
    "^@/hooks/(.*)$",
    "^@/i18n/(.*)$",
    "^@/lib/(.*)$",
    "^@/messages/(.*)$",
    "^@/schemas/(.*)$",
    "^@/app/(.*)$",
    "",
    "^[./]",
  ],
}
