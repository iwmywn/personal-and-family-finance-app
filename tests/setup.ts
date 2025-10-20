import { afterAll, afterEach, beforeAll } from "vitest"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Set environment variable BEFORE any mongodb imports
  process.env.MONGODB_URI = mongoUri
  process.env.DB_NAME = "test-db"

  // Now import and connect
  const { connect } = await import("@/lib/mongodb")
  await connect()
})

afterEach(async () => {
  const { connect } = await import("@/lib/mongodb")
  const { db } = await connect()
  const collections = await db.listCollections().toArray()

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({})
  }
})

afterAll(async () => {
  const { disconnect } = await import("@/lib/mongodb")
  await disconnect()
  await mongoServer.stop()
})
