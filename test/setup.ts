import { MongoMemoryServer } from "mongodb-memory-server"
import { afterAll, afterEach, beforeAll } from "vitest"

import { connect, disconnect } from "@/lib/mongodb"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Set environment variable for MongoDB connection
  process.env.MONGODB_URI = mongoUri

  // Connect to the in-memory database
  await connect()
})

afterEach(async () => {
  // Clear all collections after each test
  const { db } = await connect()
  const collections = await db.listCollections().toArray()

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({})
  }
})

afterAll(async () => {
  // Disconnect and stop MongoDB Memory Server
  await disconnect()
  await mongoServer.stop()
})
