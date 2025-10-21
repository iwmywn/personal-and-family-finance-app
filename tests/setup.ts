import { MongoMemoryServer } from "mongodb-memory-server"

import { connect, disconnect } from "@/lib/mongodb"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  process.env.MONGODB_URI = mongoUri
  process.env.DB_NAME = "test-db"

  await connect()
})

afterEach(async () => {
  const db = await connect()
  const collections = await db.listCollections().toArray()

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({})
  }
})

afterAll(async () => {
  await disconnect()
  await mongoServer.stop()
})
