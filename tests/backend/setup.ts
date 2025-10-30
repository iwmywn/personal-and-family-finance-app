import "@/tests/shared/mocks/translations.mock"

import { MongoMemoryServer } from "mongodb-memory-server"
import { getTranslations } from "next-intl/server"

import { connect, disconnect } from "@/lib/db"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  process.env.DB_URI = mongoUri
  process.env.DB_NAME = "test-db"

  await connect()

  const [tCommonBE, tAuthBE, tTransactionsBE, tCategoriesBE, tSettingsBE] =
    await Promise.all([
      getTranslations("common.be"),
      getTranslations("auth.be"),
      getTranslations("transactions.be"),
      getTranslations("categories.be"),
      getTranslations("settings.be"),
    ])

  Object.assign(globalThis, {
    tCommonBE,
    tAuthBE,
    tTransactionsBE,
    tCategoriesBE,
    tSettingsBE,
  })
})

afterAll(async () => {
  await disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }

  delete process.env.MONGODB_URI
  delete process.env.DB_NAME
})

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(async () => {
  const db = await connect()
  const collections = await db.listCollections().toArray()

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({})
  }
})
