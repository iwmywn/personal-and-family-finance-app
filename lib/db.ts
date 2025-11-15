import {
  MongoClient,
  type Collection,
  type Db,
  type MongoClientOptions,
  type OptionalId,
} from "mongodb"

import { env } from "@/env/server"

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
  var _mongoClient: MongoClient | undefined
  // var _indexesInitialized: boolean | undefined
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

// async function initializeIndexes(db: Db) {
//   if (globalThis._indexesInitialized) {
//     return
//   }

//   try {
//     const transactionsCollection = db.collection("transactions")
//     const categoriesCollection = db.collection("categories")
//     const budgetsCollection = db.collection("budgets")

//     await Promise.all([
//       transactionsCollection.createIndex(
//         { userId: 1, date: -1, _id: -1 },
//         { name: "userId_date__id", background: true }
//       ),
//       transactionsCollection.createIndex(
//         { userId: 1, categoryKey: 1 },
//         { name: "userId_categoryKey", background: true }
//       ),
//     ])

//     await Promise.all([
//       categoriesCollection.createIndex(
//         { userId: 1, label: 1, type: 1 },
//         { name: "userId_label_type", background: true }
//       ),
//       categoriesCollection.createIndex(
//         { categoryKey: 1 },
//         { name: "categoryKey", unique: true, background: true }
//       ),
//       categoriesCollection.createIndex(
//         { userId: 1, _id: -1 },
//         { name: "userId__id", background: true }
//       ),
//     ])

//     await Promise.all([
//       budgetsCollection.createIndex(
//         { userId: 1, categoryKey: 1, startDate: 1, endDate: 1 },
//         { name: "userId_categoryKey_startDate_endDate", background: true }
//       ),
//       budgetsCollection.createIndex(
//         { userId: 1, startDate: -1, _id: -1 },
//         { name: "userId_startDate__id", background: true }
//       ),
//       budgetsCollection.createIndex(
//         { userId: 1, categoryKey: 1 },
//         { name: "userId_categoryKey", background: true }
//       ),
//     ])

//     globalThis._indexesInitialized = true
//   } catch (error) {
//     console.error("Error initializing database indexes:", error)
//   }
// }

export async function connect() {
  if (db) {
    return db
  }

  const client = await getClientPromise()
  db = client.db(env.DB_NAME)
  globalThis._mongoClient = client

  // await initializeIndexes(db)

  return db
}

export async function disconnect() {
  if (globalThis._mongoClient) {
    await globalThis._mongoClient.close()
    globalThis._mongoClientPromise = undefined
    globalThis._mongoClient = undefined
    // globalThis._indexesInitialized = undefined
    db = undefined
  }
}

export async function collection<T>(
  collectionName: string
): Promise<Collection<OptionalId<T>>> {
  const db = await connect()
  return db.collection<OptionalId<T>>(collectionName)
}
