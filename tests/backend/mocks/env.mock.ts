vi.mock("@/env/server", () => {
  return {
    env: {
      get RECAPTCHA_SECRET() {
        return "test-recaptcha-secret"
      },
      get CRON_SECRET() {
        return "test-cron-secret"
      },
      get DB_URI() {
        return process.env.DB_URI
      },
      get DB_NAME() {
        return "test-db-name"
      },
    },
  }
})

export {}
