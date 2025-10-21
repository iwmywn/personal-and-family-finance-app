import {
  Collection,
  Db,
  MongoClient,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
  var _mongoClient: MongoClient | undefined
}

let db: Db | undefined

function getConnectionConfig() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Environment variable MONGODB_URI is not set")
  }

  if (!process.env.DB_NAME) {
    throw new Error("Environment variable DB_NAME is not set")
  }

  return {
    uri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
  }
}

function getClientPromise(): Promise<MongoClient> {
  if (!globalThis._mongoClientPromise) {
    const { uri } = getConnectionConfig()
    const options: MongoClientOptions = {}
    globalThis._mongoClientPromise = new MongoClient(uri, options).connect()
  }
  return globalThis._mongoClientPromise
}

export async function connect() {
  if (db) {
    return db
  }

  const { dbName } = getConnectionConfig()
  const client = await getClientPromise()
  db = client.db(dbName)
  globalThis._mongoClient = client

  return db
}

export async function disconnect() {
  if (globalThis._mongoClient) {
    await globalThis._mongoClient.close()
    globalThis._mongoClientPromise = undefined
    globalThis._mongoClient = undefined
    db = undefined
  }
}

export async function collection<T>(
  collectionName: string
): Promise<Collection<OptionalId<T>>> {
  const db = await connect()
  return db.collection<OptionalId<T>>(collectionName)
}
