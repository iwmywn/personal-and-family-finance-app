import { ObjectId } from "mongodb"

type BaseUser<T> = {
  _id: T
  fullName: string
  username: string
  password: string
  avatar: string
}

export type User = BaseUser<string>
export type DBUser = BaseUser<ObjectId>
