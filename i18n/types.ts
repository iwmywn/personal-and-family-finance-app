import type {
  createTranslator,
  Messages,
  NamespaceKeys,
  NestedKeyOf,
} from "next-intl"

export type TypedTranslationFunction<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
> = ReturnType<typeof createTranslator<Messages, NestedKey>>

export type NamespacedKey<T extends keyof Messages> = NestedKeyOf<Messages[T]>
