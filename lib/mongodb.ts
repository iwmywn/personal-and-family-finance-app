import {
  Collection,
  MongoClient,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Environment variable MONGODB_URI is not set")
}

if (!process.env.DB_NAME) {
  throw new Error("Environment variable DB_NAME is not set")
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME
const options: MongoClientOptions = {}

if (!globalThis._mongoClientPromise) {
  globalThis._mongoClientPromise = new MongoClient(uri, options).connect()
}

const clientPromise: Promise<MongoClient> = globalThis._mongoClientPromise

export async function connect() {
  const client = await clientPromise
  return client.db(dbName)
}

export async function disconnect() {
  if (globalThis._mongoClientPromise) {
    const client = await globalThis._mongoClientPromise
    await client.close()
    globalThis._mongoClientPromise = undefined
  }
}
export async function collection<T>(
  collectionName: string
): Promise<Collection<OptionalId<T>>> {
  const db = await connect()
  return db.collection<OptionalId<T>>(collectionName)
}
