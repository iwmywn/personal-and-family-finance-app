import {
  MongoClient,
  type Collection,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {}

if (!globalThis._mongoClientPromise) {
  globalThis._mongoClientPromise = new MongoClient(uri, options).connect()
}

const clientPromise: Promise<MongoClient> = globalThis._mongoClientPromise

export async function connect() {
  const client = await clientPromise
  const dbName = process.env.DB_NAME
  if (!dbName) {
    throw new Error("Environment variable DB_NAME is not set")
  }
  return { client, db: client.db(dbName) }
}

export async function disconnect() {
  const client = await clientPromise
  await client.close()
}

export async function collection<T>(
  collectionName: string
): Promise<Collection<OptionalId<T>>> {
  const { db } = await connect()
  return db.collection<OptionalId<T>>(collectionName)
}
