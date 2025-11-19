vi.mock("@/env/server", () => {
  return {
    env: {
      get RECAPTCHA_SECRET() {
        return "test-recaptcha-secret"
      },
      get SESSION_SECRET() {
        return "test-session-secret"
      },
      get DB_URI() {
        return process.env.DB_URI
      },
      get DB_NAME() {
        return "test-db-name"
      },
      get CRON_SECRET() {
        return "test-cron-secret"
      },
    },
  }
})

export {}
