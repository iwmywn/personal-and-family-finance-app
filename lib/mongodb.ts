import {
  MongoClient,
  type Collection,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
  }
  return uri
}

const options: MongoClientOptions = {}

function getClientPromise(): Promise<MongoClient> {
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(
      getMongoUri(),
      options
    ).connect()
  }
  return globalThis._mongoClientPromise
}

async function connectToDatabase() {
  const dbName = process.env.DB_NAME
  if (!dbName) {
    throw new Error("Environment variable DB_NAME is not set")
  }

  const client = await getClientPromise()
  return client.db(dbName)
}

export async function collection<T>(
  collectionName: string
): Promise<Collection<OptionalId<T>>> {
  const db = await connectToDatabase()
  return db.collection<OptionalId<T>>(collectionName)
}

export async function connect() {
  const client = await getClientPromise()
  const dbName = process.env.DB_NAME
  if (!dbName) {
    throw new Error("Environment variable DB_NAME is not set")
  }
  return { client, db: client.db(dbName) }
}

export async function disconnect() {
  if (globalThis._mongoClientPromise) {
    const client = await globalThis._mongoClientPromise
    await client.close()
    globalThis._mongoClientPromise = undefined
  }
}
