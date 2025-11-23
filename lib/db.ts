import {
  MongoClient,
  type Collection,
  type Db,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

import { env } from "@/env/server.mjs"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
  var _mongoClient: MongoClient | undefined
}

let db: Db | undefined

function getClientPromise(): Promise<MongoClient> {
  if (!globalThis._mongoClientPromise) {
    const options: MongoClientOptions = {}
    globalThis._mongoClientPromise = new MongoClient(
      env.DB_URI,
      options
    ).connect()
  }
  return globalThis._mongoClientPromise
}

export async function connect() {
  if (db) {
    return db
  }

  const client = await getClientPromise()
  db = client.db(env.DB_NAME)
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
