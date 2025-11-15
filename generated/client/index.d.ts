/**
 * Client
 **/

import * as runtime from "./runtime/client.js";
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Workspace
 *
 */
export type Workspace = $Result.DefaultSelection<Prisma.$WorkspacePayload>;
/**
 * Model Screen
 *
 */
export type Screen = $Result.DefaultSelection<Prisma.$ScreenPayload>;
/**
 * Model DialogEntry
 *
 */
export type DialogEntry = $Result.DefaultSelection<Prisma.$DialogEntryPayload>;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Workspaces
 * const workspaces = await prisma.workspace.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = "log" extends keyof ClientOptions
    ? ClientOptions["log"] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions["log"]>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["other"] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Workspaces
   * const workspaces = await prisma.workspace.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends "query" ? Prisma.QueryEvent : Prisma.LogEvent) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    "extends",
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.workspace`: Exposes CRUD operations for the **Workspace** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Workspaces
   * const workspaces = await prisma.workspace.findMany()
   * ```
   */
  get workspace(): Prisma.WorkspaceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.screen`: Exposes CRUD operations for the **Screen** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Screens
   * const screens = await prisma.screen.findMany()
   * ```
   */
  get screen(): Prisma.ScreenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dialogEntry`: Exposes CRUD operations for the **DialogEntry** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more DialogEntries
   * const dialogEntries = await prisma.dialogEntry.findMany()
   * ```
   */
  get dialogEntry(): Prisma.DialogEntryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics;
  export type Metric<T> = runtime.Metric<T>;
  export type MetricHistogram = runtime.MetricHistogram;
  export type MetricHistogramBucket = runtime.MetricHistogramBucket;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.19.0
   * Query Engine version: 2ba551f319ab1df4bc874a89965d8b3641056773
   */
  export type PrismaVersion = {
    client: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? "Please either choose `select` or `include`."
    : T extends SelectAndOmit
      ? "Please either choose `select` or `omit`."
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, "_avg" | "_sum" | "_count" | "_min" | "_max">> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<"OR", K>, Extends<"AND", K>>, Extends<"NOT", K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Workspace: "Workspace";
    Screen: "Screen";
    DialogEntry: "DialogEntry";
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  export type Datasources = {
    db?: Datasource;
  };

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<{ extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<
      this["params"]["extArgs"],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: "workspace" | "screen" | "dialogEntry";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Workspace: {
        payload: Prisma.$WorkspacePayload<ExtArgs>;
        fields: Prisma.WorkspaceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.WorkspaceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.WorkspaceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          findFirst: {
            args: Prisma.WorkspaceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.WorkspaceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          findMany: {
            args: Prisma.WorkspaceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[];
          };
          create: {
            args: Prisma.WorkspaceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          createMany: {
            args: Prisma.WorkspaceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.WorkspaceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[];
          };
          delete: {
            args: Prisma.WorkspaceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          update: {
            args: Prisma.WorkspaceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          deleteMany: {
            args: Prisma.WorkspaceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.WorkspaceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.WorkspaceUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[];
          };
          upsert: {
            args: Prisma.WorkspaceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>;
          };
          aggregate: {
            args: Prisma.WorkspaceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateWorkspace>;
          };
          groupBy: {
            args: Prisma.WorkspaceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<WorkspaceGroupByOutputType>[];
          };
          count: {
            args: Prisma.WorkspaceCountArgs<ExtArgs>;
            result: $Utils.Optional<WorkspaceCountAggregateOutputType> | number;
          };
        };
      };
      Screen: {
        payload: Prisma.$ScreenPayload<ExtArgs>;
        fields: Prisma.ScreenFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ScreenFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ScreenFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          findFirst: {
            args: Prisma.ScreenFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ScreenFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          findMany: {
            args: Prisma.ScreenFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>[];
          };
          create: {
            args: Prisma.ScreenCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          createMany: {
            args: Prisma.ScreenCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ScreenCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>[];
          };
          delete: {
            args: Prisma.ScreenDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          update: {
            args: Prisma.ScreenUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          deleteMany: {
            args: Prisma.ScreenDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ScreenUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ScreenUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>[];
          };
          upsert: {
            args: Prisma.ScreenUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ScreenPayload>;
          };
          aggregate: {
            args: Prisma.ScreenAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateScreen>;
          };
          groupBy: {
            args: Prisma.ScreenGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ScreenGroupByOutputType>[];
          };
          count: {
            args: Prisma.ScreenCountArgs<ExtArgs>;
            result: $Utils.Optional<ScreenCountAggregateOutputType> | number;
          };
        };
      };
      DialogEntry: {
        payload: Prisma.$DialogEntryPayload<ExtArgs>;
        fields: Prisma.DialogEntryFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DialogEntryFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DialogEntryFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          findFirst: {
            args: Prisma.DialogEntryFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DialogEntryFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          findMany: {
            args: Prisma.DialogEntryFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>[];
          };
          create: {
            args: Prisma.DialogEntryCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          createMany: {
            args: Prisma.DialogEntryCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DialogEntryCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>[];
          };
          delete: {
            args: Prisma.DialogEntryDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          update: {
            args: Prisma.DialogEntryUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          deleteMany: {
            args: Prisma.DialogEntryDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DialogEntryUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.DialogEntryUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>[];
          };
          upsert: {
            args: Prisma.DialogEntryUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DialogEntryPayload>;
          };
          aggregate: {
            args: Prisma.DialogEntryAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDialogEntry>;
          };
          groupBy: {
            args: Prisma.DialogEntryGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DialogEntryGroupByOutputType>[];
          };
          count: {
            args: Prisma.DialogEntryCountArgs<ExtArgs>;
            result: $Utils.Optional<DialogEntryCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    "define",
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = "pretty" | "colorless" | "minimal";
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {
    workspace?: WorkspaceOmit;
    screen?: ScreenOmit;
    dialogEntry?: DialogEntryOmit;
  };

  /* Types for Logging */
  export type LogLevel = "info" | "query" | "warn" | "error";
  export type LogDefinition = {
    level: LogLevel;
    emit: "stdout" | "event";
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T["level"] : T>;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | "findUnique"
    | "findUniqueOrThrow"
    | "findMany"
    | "findFirst"
    | "findFirstOrThrow"
    | "create"
    | "createMany"
    | "createManyAndReturn"
    | "update"
    | "updateMany"
    | "updateManyAndReturn"
    | "upsert"
    | "delete"
    | "deleteMany"
    | "executeRaw"
    | "queryRaw"
    | "aggregate"
    | "count"
    | "runCommandRaw"
    | "findRaw"
    | "groupBy";

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type WorkspaceCountOutputType
   */

  export type WorkspaceCountOutputType = {
    screens: number;
  };

  export type WorkspaceCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    screens?: boolean | WorkspaceCountOutputTypeCountScreensArgs;
  };

  // Custom InputTypes
  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the WorkspaceCountOutputType
     */
    select?: WorkspaceCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeCountScreensArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ScreenWhereInput;
  };

  /**
   * Count Type ScreenCountOutputType
   */

  export type ScreenCountOutputType = {
    dialogEntries: number;
  };

  export type ScreenCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    dialogEntries?: boolean | ScreenCountOutputTypeCountDialogEntriesArgs;
  };

  // Custom InputTypes
  /**
   * ScreenCountOutputType without action
   */
  export type ScreenCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ScreenCountOutputType
     */
    select?: ScreenCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * ScreenCountOutputType without action
   */
  export type ScreenCountOutputTypeCountDialogEntriesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DialogEntryWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Workspace
   */

  export type AggregateWorkspace = {
    _count: WorkspaceCountAggregateOutputType | null;
    _min: WorkspaceMinAggregateOutputType | null;
    _max: WorkspaceMaxAggregateOutputType | null;
  };

  export type WorkspaceMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type WorkspaceMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type WorkspaceCountAggregateOutputType = {
    id: number;
    userId: number;
    name: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type WorkspaceMinAggregateInputType = {
    id?: true;
    userId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type WorkspaceMaxAggregateInputType = {
    id?: true;
    userId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type WorkspaceCountAggregateInputType = {
    id?: true;
    userId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type WorkspaceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Workspace to aggregate.
     */
    where?: WorkspaceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: WorkspaceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Workspaces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Workspaces
     **/
    _count?: true | WorkspaceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: WorkspaceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: WorkspaceMaxAggregateInputType;
  };

  export type GetWorkspaceAggregateType<T extends WorkspaceAggregateArgs> = {
    [P in keyof T & keyof AggregateWorkspace]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkspace[P]>
      : GetScalarType<T[P], AggregateWorkspace[P]>;
  };

  export type WorkspaceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: WorkspaceWhereInput;
    orderBy?: WorkspaceOrderByWithAggregationInput | WorkspaceOrderByWithAggregationInput[];
    by: WorkspaceScalarFieldEnum[] | WorkspaceScalarFieldEnum;
    having?: WorkspaceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkspaceCountAggregateInputType | true;
    _min?: WorkspaceMinAggregateInputType;
    _max?: WorkspaceMaxAggregateInputType;
  };

  export type WorkspaceGroupByOutputType = {
    id: string;
    userId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _count: WorkspaceCountAggregateOutputType | null;
    _min: WorkspaceMinAggregateOutputType | null;
    _max: WorkspaceMaxAggregateOutputType | null;
  };

  type GetWorkspaceGroupByPayload<T extends WorkspaceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkspaceGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof WorkspaceGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], WorkspaceGroupByOutputType[P]>
          : GetScalarType<T[P], WorkspaceGroupByOutputType[P]>;
      }
    >
  >;

  export type WorkspaceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        userId?: boolean;
        name?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        screens?: boolean | Workspace$screensArgs<ExtArgs>;
        _count?: boolean | WorkspaceCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["workspace"]
    >;

  export type WorkspaceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      name?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs["result"]["workspace"]
  >;

  export type WorkspaceSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      userId?: boolean;
      name?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
    },
    ExtArgs["result"]["workspace"]
  >;

  export type WorkspaceSelectScalar = {
    id?: boolean;
    userId?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type WorkspaceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      "id" | "userId" | "name" | "createdAt" | "updatedAt",
      ExtArgs["result"]["workspace"]
    >;
  export type WorkspaceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      screens?: boolean | Workspace$screensArgs<ExtArgs>;
      _count?: boolean | WorkspaceCountOutputTypeDefaultArgs<ExtArgs>;
    };
  export type WorkspaceIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type WorkspaceIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $WorkspacePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "Workspace";
    objects: {
      screens: Prisma.$ScreenPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        userId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["workspace"]
    >;
    composites: {};
  };

  type WorkspaceGetPayload<S extends boolean | null | undefined | WorkspaceDefaultArgs> =
    $Result.GetResult<Prisma.$WorkspacePayload, S>;

  type WorkspaceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkspaceFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
      select?: WorkspaceCountAggregateInputType | true;
    };

  export interface WorkspaceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["Workspace"];
      meta: { name: "Workspace" };
    };
    /**
     * Find zero or one Workspace that matches the filter.
     * @param {WorkspaceFindUniqueArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkspaceFindUniqueArgs>(
      args: SelectSubset<T, WorkspaceFindUniqueArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Workspace that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkspaceFindUniqueOrThrowArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkspaceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, WorkspaceFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Workspace that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindFirstArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkspaceFindFirstArgs>(
      args?: SelectSubset<T, WorkspaceFindFirstArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Workspace that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindFirstOrThrowArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkspaceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, WorkspaceFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Workspaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Workspaces
     * const workspaces = await prisma.workspace.findMany()
     *
     * // Get first 10 Workspaces
     * const workspaces = await prisma.workspace.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const workspaceWithIdOnly = await prisma.workspace.findMany({ select: { id: true } })
     *
     */
    findMany<T extends WorkspaceFindManyArgs>(
      args?: SelectSubset<T, WorkspaceFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a Workspace.
     * @param {WorkspaceCreateArgs} args - Arguments to create a Workspace.
     * @example
     * // Create one Workspace
     * const Workspace = await prisma.workspace.create({
     *   data: {
     *     // ... data to create a Workspace
     *   }
     * })
     *
     */
    create<T extends WorkspaceCreateArgs>(
      args: SelectSubset<T, WorkspaceCreateArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Workspaces.
     * @param {WorkspaceCreateManyArgs} args - Arguments to create many Workspaces.
     * @example
     * // Create many Workspaces
     * const workspace = await prisma.workspace.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends WorkspaceCreateManyArgs>(
      args?: SelectSubset<T, WorkspaceCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Workspaces and returns the data saved in the database.
     * @param {WorkspaceCreateManyAndReturnArgs} args - Arguments to create many Workspaces.
     * @example
     * // Create many Workspaces
     * const workspace = await prisma.workspace.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Workspaces and only return the `id`
     * const workspaceWithIdOnly = await prisma.workspace.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends WorkspaceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, WorkspaceCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Workspace.
     * @param {WorkspaceDeleteArgs} args - Arguments to delete one Workspace.
     * @example
     * // Delete one Workspace
     * const Workspace = await prisma.workspace.delete({
     *   where: {
     *     // ... filter to delete one Workspace
     *   }
     * })
     *
     */
    delete<T extends WorkspaceDeleteArgs>(
      args: SelectSubset<T, WorkspaceDeleteArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Workspace.
     * @param {WorkspaceUpdateArgs} args - Arguments to update one Workspace.
     * @example
     * // Update one Workspace
     * const workspace = await prisma.workspace.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends WorkspaceUpdateArgs>(
      args: SelectSubset<T, WorkspaceUpdateArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Workspaces.
     * @param {WorkspaceDeleteManyArgs} args - Arguments to filter Workspaces to delete.
     * @example
     * // Delete a few Workspaces
     * const { count } = await prisma.workspace.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends WorkspaceDeleteManyArgs>(
      args?: SelectSubset<T, WorkspaceDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Workspaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Workspaces
     * const workspace = await prisma.workspace.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends WorkspaceUpdateManyArgs>(
      args: SelectSubset<T, WorkspaceUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Workspaces and returns the data updated in the database.
     * @param {WorkspaceUpdateManyAndReturnArgs} args - Arguments to update many Workspaces.
     * @example
     * // Update many Workspaces
     * const workspace = await prisma.workspace.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Workspaces and only return the `id`
     * const workspaceWithIdOnly = await prisma.workspace.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends WorkspaceUpdateManyAndReturnArgs>(
      args: SelectSubset<T, WorkspaceUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$WorkspacePayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Workspace.
     * @param {WorkspaceUpsertArgs} args - Arguments to update or create a Workspace.
     * @example
     * // Update or create a Workspace
     * const workspace = await prisma.workspace.upsert({
     *   create: {
     *     // ... data to create a Workspace
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Workspace we want to update
     *   }
     * })
     */
    upsert<T extends WorkspaceUpsertArgs>(
      args: SelectSubset<T, WorkspaceUpsertArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      $Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Workspaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceCountArgs} args - Arguments to filter Workspaces to count.
     * @example
     * // Count the number of Workspaces
     * const count = await prisma.workspace.count({
     *   where: {
     *     // ... the filter for the Workspaces we want to count
     *   }
     * })
     **/
    count<T extends WorkspaceCountArgs>(
      args?: Subset<T, WorkspaceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], WorkspaceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Workspace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends WorkspaceAggregateArgs>(
      args: Subset<T, WorkspaceAggregateArgs>,
    ): Prisma.PrismaPromise<GetWorkspaceAggregateType<T>>;

    /**
     * Group by Workspace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends WorkspaceGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkspaceGroupByArgs["orderBy"] }
        : { orderBy?: WorkspaceGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, WorkspaceGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetWorkspaceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Workspace model
     */
    readonly fields: WorkspaceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Workspace.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkspaceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    screens<T extends Workspace$screensArgs<ExtArgs> = {}>(
      args?: Subset<T, Workspace$screensArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Workspace model
   */
  interface WorkspaceFieldRefs {
    readonly id: FieldRef<"Workspace", "String">;
    readonly userId: FieldRef<"Workspace", "String">;
    readonly name: FieldRef<"Workspace", "String">;
    readonly createdAt: FieldRef<"Workspace", "DateTime">;
    readonly updatedAt: FieldRef<"Workspace", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Workspace findUnique
   */
  export type WorkspaceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter, which Workspace to fetch.
     */
    where: WorkspaceWhereUniqueInput;
  };

  /**
   * Workspace findUniqueOrThrow
   */
  export type WorkspaceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter, which Workspace to fetch.
     */
    where: WorkspaceWhereUniqueInput;
  };

  /**
   * Workspace findFirst
   */
  export type WorkspaceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter, which Workspace to fetch.
     */
    where?: WorkspaceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Workspaces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Workspaces.
     */
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[];
  };

  /**
   * Workspace findFirstOrThrow
   */
  export type WorkspaceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter, which Workspace to fetch.
     */
    where?: WorkspaceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Workspaces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Workspaces.
     */
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[];
  };

  /**
   * Workspace findMany
   */
  export type WorkspaceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter, which Workspaces to fetch.
     */
    where?: WorkspaceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Workspaces.
     */
    skip?: number;
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[];
  };

  /**
   * Workspace create
   */
  export type WorkspaceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * The data needed to create a Workspace.
     */
    data: XOR<WorkspaceCreateInput, WorkspaceUncheckedCreateInput>;
  };

  /**
   * Workspace createMany
   */
  export type WorkspaceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Workspaces.
     */
    data: WorkspaceCreateManyInput | WorkspaceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Workspace createManyAndReturn
   */
  export type WorkspaceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * The data used to create many Workspaces.
     */
    data: WorkspaceCreateManyInput | WorkspaceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Workspace update
   */
  export type WorkspaceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * The data needed to update a Workspace.
     */
    data: XOR<WorkspaceUpdateInput, WorkspaceUncheckedUpdateInput>;
    /**
     * Choose, which Workspace to update.
     */
    where: WorkspaceWhereUniqueInput;
  };

  /**
   * Workspace updateMany
   */
  export type WorkspaceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Workspaces.
     */
    data: XOR<WorkspaceUpdateManyMutationInput, WorkspaceUncheckedUpdateManyInput>;
    /**
     * Filter which Workspaces to update
     */
    where?: WorkspaceWhereInput;
    /**
     * Limit how many Workspaces to update.
     */
    limit?: number;
  };

  /**
   * Workspace updateManyAndReturn
   */
  export type WorkspaceUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * The data used to update Workspaces.
     */
    data: XOR<WorkspaceUpdateManyMutationInput, WorkspaceUncheckedUpdateManyInput>;
    /**
     * Filter which Workspaces to update
     */
    where?: WorkspaceWhereInput;
    /**
     * Limit how many Workspaces to update.
     */
    limit?: number;
  };

  /**
   * Workspace upsert
   */
  export type WorkspaceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * The filter to search for the Workspace to update in case it exists.
     */
    where: WorkspaceWhereUniqueInput;
    /**
     * In case the Workspace found by the `where` argument doesn't exist, create a new Workspace with this data.
     */
    create: XOR<WorkspaceCreateInput, WorkspaceUncheckedCreateInput>;
    /**
     * In case the Workspace was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkspaceUpdateInput, WorkspaceUncheckedUpdateInput>;
  };

  /**
   * Workspace delete
   */
  export type WorkspaceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
    /**
     * Filter which Workspace to delete.
     */
    where: WorkspaceWhereUniqueInput;
  };

  /**
   * Workspace deleteMany
   */
  export type WorkspaceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Workspaces to delete
     */
    where?: WorkspaceWhereInput;
    /**
     * Limit how many Workspaces to delete.
     */
    limit?: number;
  };

  /**
   * Workspace.screens
   */
  export type Workspace$screensArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    where?: ScreenWhereInput;
    orderBy?: ScreenOrderByWithRelationInput | ScreenOrderByWithRelationInput[];
    cursor?: ScreenWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: ScreenScalarFieldEnum | ScreenScalarFieldEnum[];
  };

  /**
   * Workspace without action
   */
  export type WorkspaceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null;
  };

  /**
   * Model Screen
   */

  export type AggregateScreen = {
    _count: ScreenCountAggregateOutputType | null;
    _avg: ScreenAvgAggregateOutputType | null;
    _sum: ScreenSumAggregateOutputType | null;
    _min: ScreenMinAggregateOutputType | null;
    _max: ScreenMaxAggregateOutputType | null;
  };

  export type ScreenAvgAggregateOutputType = {
    positionX: number | null;
    positionY: number | null;
    selectedPromptIndex: number | null;
  };

  export type ScreenSumAggregateOutputType = {
    positionX: number | null;
    positionY: number | null;
    selectedPromptIndex: number | null;
  };

  export type ScreenMinAggregateOutputType = {
    id: string | null;
    workspaceId: string | null;
    positionX: number | null;
    positionY: number | null;
    selectedPromptIndex: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ScreenMaxAggregateOutputType = {
    id: string | null;
    workspaceId: string | null;
    positionX: number | null;
    positionY: number | null;
    selectedPromptIndex: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type ScreenCountAggregateOutputType = {
    id: number;
    workspaceId: number;
    positionX: number;
    positionY: number;
    selectedPromptIndex: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type ScreenAvgAggregateInputType = {
    positionX?: true;
    positionY?: true;
    selectedPromptIndex?: true;
  };

  export type ScreenSumAggregateInputType = {
    positionX?: true;
    positionY?: true;
    selectedPromptIndex?: true;
  };

  export type ScreenMinAggregateInputType = {
    id?: true;
    workspaceId?: true;
    positionX?: true;
    positionY?: true;
    selectedPromptIndex?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ScreenMaxAggregateInputType = {
    id?: true;
    workspaceId?: true;
    positionX?: true;
    positionY?: true;
    selectedPromptIndex?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type ScreenCountAggregateInputType = {
    id?: true;
    workspaceId?: true;
    positionX?: true;
    positionY?: true;
    selectedPromptIndex?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type ScreenAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Screen to aggregate.
     */
    where?: ScreenWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Screens to fetch.
     */
    orderBy?: ScreenOrderByWithRelationInput | ScreenOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ScreenWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Screens from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Screens.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Screens
     **/
    _count?: true | ScreenCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: ScreenAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: ScreenSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ScreenMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ScreenMaxAggregateInputType;
  };

  export type GetScreenAggregateType<T extends ScreenAggregateArgs> = {
    [P in keyof T & keyof AggregateScreen]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScreen[P]>
      : GetScalarType<T[P], AggregateScreen[P]>;
  };

  export type ScreenGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ScreenWhereInput;
    orderBy?: ScreenOrderByWithAggregationInput | ScreenOrderByWithAggregationInput[];
    by: ScreenScalarFieldEnum[] | ScreenScalarFieldEnum;
    having?: ScreenScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScreenCountAggregateInputType | true;
    _avg?: ScreenAvgAggregateInputType;
    _sum?: ScreenSumAggregateInputType;
    _min?: ScreenMinAggregateInputType;
    _max?: ScreenMaxAggregateInputType;
  };

  export type ScreenGroupByOutputType = {
    id: string;
    workspaceId: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ScreenCountAggregateOutputType | null;
    _avg: ScreenAvgAggregateOutputType | null;
    _sum: ScreenSumAggregateOutputType | null;
    _min: ScreenMinAggregateOutputType | null;
    _max: ScreenMaxAggregateOutputType | null;
  };

  type GetScreenGroupByPayload<T extends ScreenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScreenGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof ScreenGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], ScreenGroupByOutputType[P]>
          : GetScalarType<T[P], ScreenGroupByOutputType[P]>;
      }
    >
  >;

  export type ScreenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        workspaceId?: boolean;
        positionX?: boolean;
        positionY?: boolean;
        selectedPromptIndex?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
        dialogEntries?: boolean | Screen$dialogEntriesArgs<ExtArgs>;
        _count?: boolean | ScreenCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs["result"]["screen"]
    >;

  export type ScreenSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      workspaceId?: boolean;
      positionX?: boolean;
      positionY?: boolean;
      selectedPromptIndex?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["screen"]
  >;

  export type ScreenSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      workspaceId?: boolean;
      positionX?: boolean;
      positionY?: boolean;
      selectedPromptIndex?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["screen"]
  >;

  export type ScreenSelectScalar = {
    id?: boolean;
    workspaceId?: boolean;
    positionX?: boolean;
    positionY?: boolean;
    selectedPromptIndex?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type ScreenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | "id"
      | "workspaceId"
      | "positionX"
      | "positionY"
      | "selectedPromptIndex"
      | "createdAt"
      | "updatedAt",
      ExtArgs["result"]["screen"]
    >;
  export type ScreenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
    dialogEntries?: boolean | Screen$dialogEntriesArgs<ExtArgs>;
    _count?: boolean | ScreenCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type ScreenIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
  };
  export type ScreenIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>;
  };

  export type $ScreenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Screen";
    objects: {
      workspace: Prisma.$WorkspacePayload<ExtArgs>;
      dialogEntries: Prisma.$DialogEntryPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        workspaceId: string;
        positionX: number;
        positionY: number;
        selectedPromptIndex: number | null;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["screen"]
    >;
    composites: {};
  };

  type ScreenGetPayload<S extends boolean | null | undefined | ScreenDefaultArgs> =
    $Result.GetResult<Prisma.$ScreenPayload, S>;

  type ScreenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    ScreenFindManyArgs,
    "select" | "include" | "distinct" | "omit"
  > & {
    select?: ScreenCountAggregateInputType | true;
  };

  export interface ScreenDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>["model"]["Screen"]; meta: { name: "Screen" } };
    /**
     * Find zero or one Screen that matches the filter.
     * @param {ScreenFindUniqueArgs} args - Arguments to find a Screen
     * @example
     * // Get one Screen
     * const screen = await prisma.screen.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScreenFindUniqueArgs>(
      args: SelectSubset<T, ScreenFindUniqueArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Screen that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScreenFindUniqueOrThrowArgs} args - Arguments to find a Screen
     * @example
     * // Get one Screen
     * const screen = await prisma.screen.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScreenFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ScreenFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Screen that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenFindFirstArgs} args - Arguments to find a Screen
     * @example
     * // Get one Screen
     * const screen = await prisma.screen.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScreenFindFirstArgs>(
      args?: SelectSubset<T, ScreenFindFirstArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Screen that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenFindFirstOrThrowArgs} args - Arguments to find a Screen
     * @example
     * // Get one Screen
     * const screen = await prisma.screen.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScreenFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ScreenFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Screens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Screens
     * const screens = await prisma.screen.findMany()
     *
     * // Get first 10 Screens
     * const screens = await prisma.screen.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const screenWithIdOnly = await prisma.screen.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ScreenFindManyArgs>(
      args?: SelectSubset<T, ScreenFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a Screen.
     * @param {ScreenCreateArgs} args - Arguments to create a Screen.
     * @example
     * // Create one Screen
     * const Screen = await prisma.screen.create({
     *   data: {
     *     // ... data to create a Screen
     *   }
     * })
     *
     */
    create<T extends ScreenCreateArgs>(
      args: SelectSubset<T, ScreenCreateArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Screens.
     * @param {ScreenCreateManyArgs} args - Arguments to create many Screens.
     * @example
     * // Create many Screens
     * const screen = await prisma.screen.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ScreenCreateManyArgs>(
      args?: SelectSubset<T, ScreenCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Screens and returns the data saved in the database.
     * @param {ScreenCreateManyAndReturnArgs} args - Arguments to create many Screens.
     * @example
     * // Create many Screens
     * const screen = await prisma.screen.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Screens and only return the `id`
     * const screenWithIdOnly = await prisma.screen.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ScreenCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ScreenCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>
    >;

    /**
     * Delete a Screen.
     * @param {ScreenDeleteArgs} args - Arguments to delete one Screen.
     * @example
     * // Delete one Screen
     * const Screen = await prisma.screen.delete({
     *   where: {
     *     // ... filter to delete one Screen
     *   }
     * })
     *
     */
    delete<T extends ScreenDeleteArgs>(
      args: SelectSubset<T, ScreenDeleteArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Screen.
     * @param {ScreenUpdateArgs} args - Arguments to update one Screen.
     * @example
     * // Update one Screen
     * const screen = await prisma.screen.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ScreenUpdateArgs>(
      args: SelectSubset<T, ScreenUpdateArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Screens.
     * @param {ScreenDeleteManyArgs} args - Arguments to filter Screens to delete.
     * @example
     * // Delete a few Screens
     * const { count } = await prisma.screen.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ScreenDeleteManyArgs>(
      args?: SelectSubset<T, ScreenDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Screens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Screens
     * const screen = await prisma.screen.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ScreenUpdateManyArgs>(
      args: SelectSubset<T, ScreenUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Screens and returns the data updated in the database.
     * @param {ScreenUpdateManyAndReturnArgs} args - Arguments to update many Screens.
     * @example
     * // Update many Screens
     * const screen = await prisma.screen.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Screens and only return the `id`
     * const screenWithIdOnly = await prisma.screen.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ScreenUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ScreenUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>
    >;

    /**
     * Create or update one Screen.
     * @param {ScreenUpsertArgs} args - Arguments to update or create a Screen.
     * @example
     * // Update or create a Screen
     * const screen = await prisma.screen.upsert({
     *   create: {
     *     // ... data to create a Screen
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Screen we want to update
     *   }
     * })
     */
    upsert<T extends ScreenUpsertArgs>(
      args: SelectSubset<T, ScreenUpsertArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Screens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenCountArgs} args - Arguments to filter Screens to count.
     * @example
     * // Count the number of Screens
     * const count = await prisma.screen.count({
     *   where: {
     *     // ... the filter for the Screens we want to count
     *   }
     * })
     **/
    count<T extends ScreenCountArgs>(
      args?: Subset<T, ScreenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], ScreenCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Screen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ScreenAggregateArgs>(
      args: Subset<T, ScreenAggregateArgs>,
    ): Prisma.PrismaPromise<GetScreenAggregateType<T>>;

    /**
     * Group by Screen.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScreenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ScreenGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScreenGroupByArgs["orderBy"] }
        : { orderBy?: ScreenGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ScreenGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetScreenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Screen model
     */
    readonly fields: ScreenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Screen.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScreenClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    workspace<T extends WorkspaceDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, WorkspaceDefaultArgs<ExtArgs>>,
    ): Prisma__WorkspaceClient<
      | $Result.GetResult<
          Prisma.$WorkspacePayload<ExtArgs>,
          T,
          "findUniqueOrThrow",
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    dialogEntries<T extends Screen$dialogEntriesArgs<ExtArgs> = {}>(
      args?: Subset<T, Screen$dialogEntriesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Screen model
   */
  interface ScreenFieldRefs {
    readonly id: FieldRef<"Screen", "String">;
    readonly workspaceId: FieldRef<"Screen", "String">;
    readonly positionX: FieldRef<"Screen", "Float">;
    readonly positionY: FieldRef<"Screen", "Float">;
    readonly selectedPromptIndex: FieldRef<"Screen", "Int">;
    readonly createdAt: FieldRef<"Screen", "DateTime">;
    readonly updatedAt: FieldRef<"Screen", "DateTime">;
  }

  // Custom InputTypes
  /**
   * Screen findUnique
   */
  export type ScreenFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    /**
     * Filter, which Screen to fetch.
     */
    where: ScreenWhereUniqueInput;
  };

  /**
   * Screen findUniqueOrThrow
   */
  export type ScreenFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    /**
     * Filter, which Screen to fetch.
     */
    where: ScreenWhereUniqueInput;
  };

  /**
   * Screen findFirst
   */
  export type ScreenFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    /**
     * Filter, which Screen to fetch.
     */
    where?: ScreenWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Screens to fetch.
     */
    orderBy?: ScreenOrderByWithRelationInput | ScreenOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Screens.
     */
    cursor?: ScreenWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Screens from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Screens.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Screens.
     */
    distinct?: ScreenScalarFieldEnum | ScreenScalarFieldEnum[];
  };

  /**
   * Screen findFirstOrThrow
   */
  export type ScreenFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    /**
     * Filter, which Screen to fetch.
     */
    where?: ScreenWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Screens to fetch.
     */
    orderBy?: ScreenOrderByWithRelationInput | ScreenOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Screens.
     */
    cursor?: ScreenWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Screens from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Screens.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Screens.
     */
    distinct?: ScreenScalarFieldEnum | ScreenScalarFieldEnum[];
  };

  /**
   * Screen findMany
   */
  export type ScreenFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
    /**
     * Filter, which Screens to fetch.
     */
    where?: ScreenWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Screens to fetch.
     */
    orderBy?: ScreenOrderByWithRelationInput | ScreenOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Screens.
     */
    cursor?: ScreenWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Screens from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Screens.
     */
    skip?: number;
    distinct?: ScreenScalarFieldEnum | ScreenScalarFieldEnum[];
  };

  /**
   * Screen create
   */
  export type ScreenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Screen
       */
      select?: ScreenSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the Screen
       */
      omit?: ScreenOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: ScreenInclude<ExtArgs> | null;
      /**
       * The data needed to create a Screen.
       */
      data: XOR<ScreenCreateInput, ScreenUncheckedCreateInput>;
    };

  /**
   * Screen createMany
   */
  export type ScreenCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Screens.
     */
    data: ScreenCreateManyInput | ScreenCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Screen createManyAndReturn
   */
  export type ScreenCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * The data used to create many Screens.
     */
    data: ScreenCreateManyInput | ScreenCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Screen update
   */
  export type ScreenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Screen
       */
      select?: ScreenSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the Screen
       */
      omit?: ScreenOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: ScreenInclude<ExtArgs> | null;
      /**
       * The data needed to update a Screen.
       */
      data: XOR<ScreenUpdateInput, ScreenUncheckedUpdateInput>;
      /**
       * Choose, which Screen to update.
       */
      where: ScreenWhereUniqueInput;
    };

  /**
   * Screen updateMany
   */
  export type ScreenUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Screens.
     */
    data: XOR<ScreenUpdateManyMutationInput, ScreenUncheckedUpdateManyInput>;
    /**
     * Filter which Screens to update
     */
    where?: ScreenWhereInput;
    /**
     * Limit how many Screens to update.
     */
    limit?: number;
  };

  /**
   * Screen updateManyAndReturn
   */
  export type ScreenUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * The data used to update Screens.
     */
    data: XOR<ScreenUpdateManyMutationInput, ScreenUncheckedUpdateManyInput>;
    /**
     * Filter which Screens to update
     */
    where?: ScreenWhereInput;
    /**
     * Limit how many Screens to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Screen upsert
   */
  export type ScreenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Screen
       */
      select?: ScreenSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the Screen
       */
      omit?: ScreenOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: ScreenInclude<ExtArgs> | null;
      /**
       * The filter to search for the Screen to update in case it exists.
       */
      where: ScreenWhereUniqueInput;
      /**
       * In case the Screen found by the `where` argument doesn't exist, create a new Screen with this data.
       */
      create: XOR<ScreenCreateInput, ScreenUncheckedCreateInput>;
      /**
       * In case the Screen was found with the provided `where` argument, update it with this data.
       */
      update: XOR<ScreenUpdateInput, ScreenUncheckedUpdateInput>;
    };

  /**
   * Screen delete
   */
  export type ScreenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the Screen
       */
      select?: ScreenSelect<ExtArgs> | null;
      /**
       * Omit specific fields from the Screen
       */
      omit?: ScreenOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: ScreenInclude<ExtArgs> | null;
      /**
       * Filter which Screen to delete.
       */
      where: ScreenWhereUniqueInput;
    };

  /**
   * Screen deleteMany
   */
  export type ScreenDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Screens to delete
     */
    where?: ScreenWhereInput;
    /**
     * Limit how many Screens to delete.
     */
    limit?: number;
  };

  /**
   * Screen.dialogEntries
   */
  export type Screen$dialogEntriesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    where?: DialogEntryWhereInput;
    orderBy?: DialogEntryOrderByWithRelationInput | DialogEntryOrderByWithRelationInput[];
    cursor?: DialogEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DialogEntryScalarFieldEnum | DialogEntryScalarFieldEnum[];
  };

  /**
   * Screen without action
   */
  export type ScreenDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Screen
     */
    select?: ScreenSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Screen
     */
    omit?: ScreenOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ScreenInclude<ExtArgs> | null;
  };

  /**
   * Model DialogEntry
   */

  export type AggregateDialogEntry = {
    _count: DialogEntryCountAggregateOutputType | null;
    _avg: DialogEntryAvgAggregateOutputType | null;
    _sum: DialogEntrySumAggregateOutputType | null;
    _min: DialogEntryMinAggregateOutputType | null;
    _max: DialogEntryMaxAggregateOutputType | null;
  };

  export type DialogEntryAvgAggregateOutputType = {
    timestamp: number | null;
  };

  export type DialogEntrySumAggregateOutputType = {
    timestamp: bigint | null;
  };

  export type DialogEntryMinAggregateOutputType = {
    id: string | null;
    screenId: string | null;
    prompt: string | null;
    html: string | null;
    title: string | null;
    timestamp: bigint | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DialogEntryMaxAggregateOutputType = {
    id: string | null;
    screenId: string | null;
    prompt: string | null;
    html: string | null;
    title: string | null;
    timestamp: bigint | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type DialogEntryCountAggregateOutputType = {
    id: number;
    screenId: number;
    prompt: number;
    html: number;
    title: number;
    arrows: number;
    timestamp: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type DialogEntryAvgAggregateInputType = {
    timestamp?: true;
  };

  export type DialogEntrySumAggregateInputType = {
    timestamp?: true;
  };

  export type DialogEntryMinAggregateInputType = {
    id?: true;
    screenId?: true;
    prompt?: true;
    html?: true;
    title?: true;
    timestamp?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DialogEntryMaxAggregateInputType = {
    id?: true;
    screenId?: true;
    prompt?: true;
    html?: true;
    title?: true;
    timestamp?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type DialogEntryCountAggregateInputType = {
    id?: true;
    screenId?: true;
    prompt?: true;
    html?: true;
    title?: true;
    arrows?: true;
    timestamp?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type DialogEntryAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DialogEntry to aggregate.
     */
    where?: DialogEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DialogEntries to fetch.
     */
    orderBy?: DialogEntryOrderByWithRelationInput | DialogEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DialogEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DialogEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DialogEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DialogEntries
     **/
    _count?: true | DialogEntryCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
     **/
    _avg?: DialogEntryAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
     **/
    _sum?: DialogEntrySumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DialogEntryMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DialogEntryMaxAggregateInputType;
  };

  export type GetDialogEntryAggregateType<T extends DialogEntryAggregateArgs> = {
    [P in keyof T & keyof AggregateDialogEntry]: P extends "_count" | "count"
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDialogEntry[P]>
      : GetScalarType<T[P], AggregateDialogEntry[P]>;
  };

  export type DialogEntryGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DialogEntryWhereInput;
    orderBy?: DialogEntryOrderByWithAggregationInput | DialogEntryOrderByWithAggregationInput[];
    by: DialogEntryScalarFieldEnum[] | DialogEntryScalarFieldEnum;
    having?: DialogEntryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DialogEntryCountAggregateInputType | true;
    _avg?: DialogEntryAvgAggregateInputType;
    _sum?: DialogEntrySumAggregateInputType;
    _min?: DialogEntryMinAggregateInputType;
    _max?: DialogEntryMaxAggregateInputType;
  };

  export type DialogEntryGroupByOutputType = {
    id: string;
    screenId: string;
    prompt: string;
    html: string | null;
    title: string | null;
    arrows: JsonValue | null;
    timestamp: bigint;
    createdAt: Date;
    updatedAt: Date;
    _count: DialogEntryCountAggregateOutputType | null;
    _avg: DialogEntryAvgAggregateOutputType | null;
    _sum: DialogEntrySumAggregateOutputType | null;
    _min: DialogEntryMinAggregateOutputType | null;
    _max: DialogEntryMaxAggregateOutputType | null;
  };

  type GetDialogEntryGroupByPayload<T extends DialogEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DialogEntryGroupByOutputType, T["by"]> & {
        [P in keyof T & keyof DialogEntryGroupByOutputType]: P extends "_count"
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DialogEntryGroupByOutputType[P]>
          : GetScalarType<T[P], DialogEntryGroupByOutputType[P]>;
      }
    >
  >;

  export type DialogEntrySelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      screenId?: boolean;
      prompt?: boolean;
      html?: boolean;
      title?: boolean;
      arrows?: boolean;
      timestamp?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      screen?: boolean | ScreenDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["dialogEntry"]
  >;

  export type DialogEntrySelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      screenId?: boolean;
      prompt?: boolean;
      html?: boolean;
      title?: boolean;
      arrows?: boolean;
      timestamp?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      screen?: boolean | ScreenDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["dialogEntry"]
  >;

  export type DialogEntrySelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      screenId?: boolean;
      prompt?: boolean;
      html?: boolean;
      title?: boolean;
      arrows?: boolean;
      timestamp?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      screen?: boolean | ScreenDefaultArgs<ExtArgs>;
    },
    ExtArgs["result"]["dialogEntry"]
  >;

  export type DialogEntrySelectScalar = {
    id?: boolean;
    screenId?: boolean;
    prompt?: boolean;
    html?: boolean;
    title?: boolean;
    arrows?: boolean;
    timestamp?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type DialogEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      | "id"
      | "screenId"
      | "prompt"
      | "html"
      | "title"
      | "arrows"
      | "timestamp"
      | "createdAt"
      | "updatedAt",
      ExtArgs["result"]["dialogEntry"]
    >;
  export type DialogEntryInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    screen?: boolean | ScreenDefaultArgs<ExtArgs>;
  };
  export type DialogEntryIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    screen?: boolean | ScreenDefaultArgs<ExtArgs>;
  };
  export type DialogEntryIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    screen?: boolean | ScreenDefaultArgs<ExtArgs>;
  };

  export type $DialogEntryPayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: "DialogEntry";
    objects: {
      screen: Prisma.$ScreenPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        screenId: string;
        prompt: string;
        html: string | null;
        title: string | null;
        arrows: Prisma.JsonValue | null;
        timestamp: bigint;
        createdAt: Date;
        updatedAt: Date;
      },
      ExtArgs["result"]["dialogEntry"]
    >;
    composites: {};
  };

  type DialogEntryGetPayload<S extends boolean | null | undefined | DialogEntryDefaultArgs> =
    $Result.GetResult<Prisma.$DialogEntryPayload, S>;

  type DialogEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DialogEntryFindManyArgs, "select" | "include" | "distinct" | "omit"> & {
      select?: DialogEntryCountAggregateInputType | true;
    };

  export interface DialogEntryDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>["model"]["DialogEntry"];
      meta: { name: "DialogEntry" };
    };
    /**
     * Find zero or one DialogEntry that matches the filter.
     * @param {DialogEntryFindUniqueArgs} args - Arguments to find a DialogEntry
     * @example
     * // Get one DialogEntry
     * const dialogEntry = await prisma.dialogEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DialogEntryFindUniqueArgs>(
      args: SelectSubset<T, DialogEntryFindUniqueArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "findUnique",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one DialogEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DialogEntryFindUniqueOrThrowArgs} args - Arguments to find a DialogEntry
     * @example
     * // Get one DialogEntry
     * const dialogEntry = await prisma.dialogEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DialogEntryFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DialogEntryFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "findUniqueOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first DialogEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryFindFirstArgs} args - Arguments to find a DialogEntry
     * @example
     * // Get one DialogEntry
     * const dialogEntry = await prisma.dialogEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DialogEntryFindFirstArgs>(
      args?: SelectSubset<T, DialogEntryFindFirstArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "findFirst",
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first DialogEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryFindFirstOrThrowArgs} args - Arguments to find a DialogEntry
     * @example
     * // Get one DialogEntry
     * const dialogEntry = await prisma.dialogEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DialogEntryFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DialogEntryFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "findFirstOrThrow",
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more DialogEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DialogEntries
     * const dialogEntries = await prisma.dialogEntry.findMany()
     *
     * // Get first 10 DialogEntries
     * const dialogEntries = await prisma.dialogEntry.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const dialogEntryWithIdOnly = await prisma.dialogEntry.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DialogEntryFindManyArgs>(
      args?: SelectSubset<T, DialogEntryFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>
    >;

    /**
     * Create a DialogEntry.
     * @param {DialogEntryCreateArgs} args - Arguments to create a DialogEntry.
     * @example
     * // Create one DialogEntry
     * const DialogEntry = await prisma.dialogEntry.create({
     *   data: {
     *     // ... data to create a DialogEntry
     *   }
     * })
     *
     */
    create<T extends DialogEntryCreateArgs>(
      args: SelectSubset<T, DialogEntryCreateArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many DialogEntries.
     * @param {DialogEntryCreateManyArgs} args - Arguments to create many DialogEntries.
     * @example
     * // Create many DialogEntries
     * const dialogEntry = await prisma.dialogEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DialogEntryCreateManyArgs>(
      args?: SelectSubset<T, DialogEntryCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many DialogEntries and returns the data saved in the database.
     * @param {DialogEntryCreateManyAndReturnArgs} args - Arguments to create many DialogEntries.
     * @example
     * // Create many DialogEntries
     * const dialogEntry = await prisma.dialogEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DialogEntries and only return the `id`
     * const dialogEntryWithIdOnly = await prisma.dialogEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DialogEntryCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DialogEntryCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "createManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a DialogEntry.
     * @param {DialogEntryDeleteArgs} args - Arguments to delete one DialogEntry.
     * @example
     * // Delete one DialogEntry
     * const DialogEntry = await prisma.dialogEntry.delete({
     *   where: {
     *     // ... filter to delete one DialogEntry
     *   }
     * })
     *
     */
    delete<T extends DialogEntryDeleteArgs>(
      args: SelectSubset<T, DialogEntryDeleteArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one DialogEntry.
     * @param {DialogEntryUpdateArgs} args - Arguments to update one DialogEntry.
     * @example
     * // Update one DialogEntry
     * const dialogEntry = await prisma.dialogEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DialogEntryUpdateArgs>(
      args: SelectSubset<T, DialogEntryUpdateArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more DialogEntries.
     * @param {DialogEntryDeleteManyArgs} args - Arguments to filter DialogEntries to delete.
     * @example
     * // Delete a few DialogEntries
     * const { count } = await prisma.dialogEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DialogEntryDeleteManyArgs>(
      args?: SelectSubset<T, DialogEntryDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DialogEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DialogEntries
     * const dialogEntry = await prisma.dialogEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DialogEntryUpdateManyArgs>(
      args: SelectSubset<T, DialogEntryUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DialogEntries and returns the data updated in the database.
     * @param {DialogEntryUpdateManyAndReturnArgs} args - Arguments to update many DialogEntries.
     * @example
     * // Update many DialogEntries
     * const dialogEntry = await prisma.dialogEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DialogEntries and only return the `id`
     * const dialogEntryWithIdOnly = await prisma.dialogEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends DialogEntryUpdateManyAndReturnArgs>(
      args: SelectSubset<T, DialogEntryUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DialogEntryPayload<ExtArgs>,
        T,
        "updateManyAndReturn",
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one DialogEntry.
     * @param {DialogEntryUpsertArgs} args - Arguments to update or create a DialogEntry.
     * @example
     * // Update or create a DialogEntry
     * const dialogEntry = await prisma.dialogEntry.upsert({
     *   create: {
     *     // ... data to create a DialogEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DialogEntry we want to update
     *   }
     * })
     */
    upsert<T extends DialogEntryUpsertArgs>(
      args: SelectSubset<T, DialogEntryUpsertArgs<ExtArgs>>,
    ): Prisma__DialogEntryClient<
      $Result.GetResult<Prisma.$DialogEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of DialogEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryCountArgs} args - Arguments to filter DialogEntries to count.
     * @example
     * // Count the number of DialogEntries
     * const count = await prisma.dialogEntry.count({
     *   where: {
     *     // ... the filter for the DialogEntries we want to count
     *   }
     * })
     **/
    count<T extends DialogEntryCountArgs>(
      args?: Subset<T, DialogEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<"select", any>
        ? T["select"] extends true
          ? number
          : GetScalarType<T["select"], DialogEntryCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a DialogEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DialogEntryAggregateArgs>(
      args: Subset<T, DialogEntryAggregateArgs>,
    ): Prisma.PrismaPromise<GetDialogEntryAggregateType<T>>;

    /**
     * Group by DialogEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DialogEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DialogEntryGroupByArgs,
      HasSelectOrTake extends Or<Extends<"skip", Keys<T>>, Extends<"take", Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DialogEntryGroupByArgs["orderBy"] }
        : { orderBy?: DialogEntryGroupByArgs["orderBy"] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T["orderBy"]>>>,
      ByFields extends MaybeTupleToUnion<T["by"]>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T["having"]>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T["by"] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, "Field ", P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : "take" extends Keys<T>
            ? "orderBy" extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : "skip" extends Keys<T>
              ? "orderBy" extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, DialogEntryGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetDialogEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DialogEntry model
     */
    readonly fields: DialogEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DialogEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DialogEntryClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    screen<T extends ScreenDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ScreenDefaultArgs<ExtArgs>>,
    ): Prisma__ScreenClient<
      | $Result.GetResult<Prisma.$ScreenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the DialogEntry model
   */
  interface DialogEntryFieldRefs {
    readonly id: FieldRef<"DialogEntry", "String">;
    readonly screenId: FieldRef<"DialogEntry", "String">;
    readonly prompt: FieldRef<"DialogEntry", "String">;
    readonly html: FieldRef<"DialogEntry", "String">;
    readonly title: FieldRef<"DialogEntry", "String">;
    readonly arrows: FieldRef<"DialogEntry", "Json">;
    readonly timestamp: FieldRef<"DialogEntry", "BigInt">;
    readonly createdAt: FieldRef<"DialogEntry", "DateTime">;
    readonly updatedAt: FieldRef<"DialogEntry", "DateTime">;
  }

  // Custom InputTypes
  /**
   * DialogEntry findUnique
   */
  export type DialogEntryFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter, which DialogEntry to fetch.
     */
    where: DialogEntryWhereUniqueInput;
  };

  /**
   * DialogEntry findUniqueOrThrow
   */
  export type DialogEntryFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter, which DialogEntry to fetch.
     */
    where: DialogEntryWhereUniqueInput;
  };

  /**
   * DialogEntry findFirst
   */
  export type DialogEntryFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter, which DialogEntry to fetch.
     */
    where?: DialogEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DialogEntries to fetch.
     */
    orderBy?: DialogEntryOrderByWithRelationInput | DialogEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DialogEntries.
     */
    cursor?: DialogEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DialogEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DialogEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DialogEntries.
     */
    distinct?: DialogEntryScalarFieldEnum | DialogEntryScalarFieldEnum[];
  };

  /**
   * DialogEntry findFirstOrThrow
   */
  export type DialogEntryFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter, which DialogEntry to fetch.
     */
    where?: DialogEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DialogEntries to fetch.
     */
    orderBy?: DialogEntryOrderByWithRelationInput | DialogEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DialogEntries.
     */
    cursor?: DialogEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DialogEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DialogEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DialogEntries.
     */
    distinct?: DialogEntryScalarFieldEnum | DialogEntryScalarFieldEnum[];
  };

  /**
   * DialogEntry findMany
   */
  export type DialogEntryFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter, which DialogEntries to fetch.
     */
    where?: DialogEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DialogEntries to fetch.
     */
    orderBy?: DialogEntryOrderByWithRelationInput | DialogEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DialogEntries.
     */
    cursor?: DialogEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DialogEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DialogEntries.
     */
    skip?: number;
    distinct?: DialogEntryScalarFieldEnum | DialogEntryScalarFieldEnum[];
  };

  /**
   * DialogEntry create
   */
  export type DialogEntryCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * The data needed to create a DialogEntry.
     */
    data: XOR<DialogEntryCreateInput, DialogEntryUncheckedCreateInput>;
  };

  /**
   * DialogEntry createMany
   */
  export type DialogEntryCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many DialogEntries.
     */
    data: DialogEntryCreateManyInput | DialogEntryCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * DialogEntry createManyAndReturn
   */
  export type DialogEntryCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * The data used to create many DialogEntries.
     */
    data: DialogEntryCreateManyInput | DialogEntryCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DialogEntry update
   */
  export type DialogEntryUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * The data needed to update a DialogEntry.
     */
    data: XOR<DialogEntryUpdateInput, DialogEntryUncheckedUpdateInput>;
    /**
     * Choose, which DialogEntry to update.
     */
    where: DialogEntryWhereUniqueInput;
  };

  /**
   * DialogEntry updateMany
   */
  export type DialogEntryUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update DialogEntries.
     */
    data: XOR<DialogEntryUpdateManyMutationInput, DialogEntryUncheckedUpdateManyInput>;
    /**
     * Filter which DialogEntries to update
     */
    where?: DialogEntryWhereInput;
    /**
     * Limit how many DialogEntries to update.
     */
    limit?: number;
  };

  /**
   * DialogEntry updateManyAndReturn
   */
  export type DialogEntryUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * The data used to update DialogEntries.
     */
    data: XOR<DialogEntryUpdateManyMutationInput, DialogEntryUncheckedUpdateManyInput>;
    /**
     * Filter which DialogEntries to update
     */
    where?: DialogEntryWhereInput;
    /**
     * Limit how many DialogEntries to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DialogEntry upsert
   */
  export type DialogEntryUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * The filter to search for the DialogEntry to update in case it exists.
     */
    where: DialogEntryWhereUniqueInput;
    /**
     * In case the DialogEntry found by the `where` argument doesn't exist, create a new DialogEntry with this data.
     */
    create: XOR<DialogEntryCreateInput, DialogEntryUncheckedCreateInput>;
    /**
     * In case the DialogEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DialogEntryUpdateInput, DialogEntryUncheckedUpdateInput>;
  };

  /**
   * DialogEntry delete
   */
  export type DialogEntryDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
    /**
     * Filter which DialogEntry to delete.
     */
    where: DialogEntryWhereUniqueInput;
  };

  /**
   * DialogEntry deleteMany
   */
  export type DialogEntryDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DialogEntries to delete
     */
    where?: DialogEntryWhereInput;
    /**
     * Limit how many DialogEntries to delete.
     */
    limit?: number;
  };

  /**
   * DialogEntry without action
   */
  export type DialogEntryDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DialogEntry
     */
    select?: DialogEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DialogEntry
     */
    omit?: DialogEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DialogEntryInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: "ReadUncommitted";
    ReadCommitted: "ReadCommitted";
    RepeatableRead: "RepeatableRead";
    Serializable: "Serializable";
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const WorkspaceScalarFieldEnum: {
    id: "id";
    userId: "userId";
    name: "name";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type WorkspaceScalarFieldEnum =
    (typeof WorkspaceScalarFieldEnum)[keyof typeof WorkspaceScalarFieldEnum];

  export const ScreenScalarFieldEnum: {
    id: "id";
    workspaceId: "workspaceId";
    positionX: "positionX";
    positionY: "positionY";
    selectedPromptIndex: "selectedPromptIndex";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type ScreenScalarFieldEnum =
    (typeof ScreenScalarFieldEnum)[keyof typeof ScreenScalarFieldEnum];

  export const DialogEntryScalarFieldEnum: {
    id: "id";
    screenId: "screenId";
    prompt: "prompt";
    html: "html";
    title: "title";
    arrows: "arrows";
    timestamp: "timestamp";
    createdAt: "createdAt";
    updatedAt: "updatedAt";
  };

  export type DialogEntryScalarFieldEnum =
    (typeof DialogEntryScalarFieldEnum)[keyof typeof DialogEntryScalarFieldEnum];

  export const SortOrder: {
    asc: "asc";
    desc: "desc";
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
  };

  export type NullableJsonNullValueInput =
    (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];

  export const QueryMode: {
    default: "default";
    insensitive: "insensitive";
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: "first";
    last: "last";
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  export const JsonNullValueFilter: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String">;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "String[]">;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "DateTime">;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "DateTime[]"
  >;

  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float">;

  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Float[]">;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int">;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Int[]">;

  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "Json">;

  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    "QueryMode"
  >;

  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "BigInt">;

  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, "BigInt[]">;

  /**
   * Deep Input Types
   */

  export type WorkspaceWhereInput = {
    AND?: WorkspaceWhereInput | WorkspaceWhereInput[];
    OR?: WorkspaceWhereInput[];
    NOT?: WorkspaceWhereInput | WorkspaceWhereInput[];
    id?: StringFilter<"Workspace"> | string;
    userId?: StringFilter<"Workspace"> | string;
    name?: StringFilter<"Workspace"> | string;
    createdAt?: DateTimeFilter<"Workspace"> | Date | string;
    updatedAt?: DateTimeFilter<"Workspace"> | Date | string;
    screens?: ScreenListRelationFilter;
  };

  export type WorkspaceOrderByWithRelationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    screens?: ScreenOrderByRelationAggregateInput;
  };

  export type WorkspaceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      userId_name?: WorkspaceUserIdNameCompoundUniqueInput;
      AND?: WorkspaceWhereInput | WorkspaceWhereInput[];
      OR?: WorkspaceWhereInput[];
      NOT?: WorkspaceWhereInput | WorkspaceWhereInput[];
      userId?: StringFilter<"Workspace"> | string;
      name?: StringFilter<"Workspace"> | string;
      createdAt?: DateTimeFilter<"Workspace"> | Date | string;
      updatedAt?: DateTimeFilter<"Workspace"> | Date | string;
      screens?: ScreenListRelationFilter;
    },
    "id" | "userId_name"
  >;

  export type WorkspaceOrderByWithAggregationInput = {
    id?: SortOrder;
    userId?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: WorkspaceCountOrderByAggregateInput;
    _max?: WorkspaceMaxOrderByAggregateInput;
    _min?: WorkspaceMinOrderByAggregateInput;
  };

  export type WorkspaceScalarWhereWithAggregatesInput = {
    AND?: WorkspaceScalarWhereWithAggregatesInput | WorkspaceScalarWhereWithAggregatesInput[];
    OR?: WorkspaceScalarWhereWithAggregatesInput[];
    NOT?: WorkspaceScalarWhereWithAggregatesInput | WorkspaceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Workspace"> | string;
    userId?: StringWithAggregatesFilter<"Workspace"> | string;
    name?: StringWithAggregatesFilter<"Workspace"> | string;
    createdAt?: DateTimeWithAggregatesFilter<"Workspace"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"Workspace"> | Date | string;
  };

  export type ScreenWhereInput = {
    AND?: ScreenWhereInput | ScreenWhereInput[];
    OR?: ScreenWhereInput[];
    NOT?: ScreenWhereInput | ScreenWhereInput[];
    id?: StringFilter<"Screen"> | string;
    workspaceId?: StringFilter<"Screen"> | string;
    positionX?: FloatFilter<"Screen"> | number;
    positionY?: FloatFilter<"Screen"> | number;
    selectedPromptIndex?: IntNullableFilter<"Screen"> | number | null;
    createdAt?: DateTimeFilter<"Screen"> | Date | string;
    updatedAt?: DateTimeFilter<"Screen"> | Date | string;
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>;
    dialogEntries?: DialogEntryListRelationFilter;
  };

  export type ScreenOrderByWithRelationInput = {
    id?: SortOrder;
    workspaceId?: SortOrder;
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    workspace?: WorkspaceOrderByWithRelationInput;
    dialogEntries?: DialogEntryOrderByRelationAggregateInput;
  };

  export type ScreenWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: ScreenWhereInput | ScreenWhereInput[];
      OR?: ScreenWhereInput[];
      NOT?: ScreenWhereInput | ScreenWhereInput[];
      workspaceId?: StringFilter<"Screen"> | string;
      positionX?: FloatFilter<"Screen"> | number;
      positionY?: FloatFilter<"Screen"> | number;
      selectedPromptIndex?: IntNullableFilter<"Screen"> | number | null;
      createdAt?: DateTimeFilter<"Screen"> | Date | string;
      updatedAt?: DateTimeFilter<"Screen"> | Date | string;
      workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>;
      dialogEntries?: DialogEntryListRelationFilter;
    },
    "id"
  >;

  export type ScreenOrderByWithAggregationInput = {
    id?: SortOrder;
    workspaceId?: SortOrder;
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: ScreenCountOrderByAggregateInput;
    _avg?: ScreenAvgOrderByAggregateInput;
    _max?: ScreenMaxOrderByAggregateInput;
    _min?: ScreenMinOrderByAggregateInput;
    _sum?: ScreenSumOrderByAggregateInput;
  };

  export type ScreenScalarWhereWithAggregatesInput = {
    AND?: ScreenScalarWhereWithAggregatesInput | ScreenScalarWhereWithAggregatesInput[];
    OR?: ScreenScalarWhereWithAggregatesInput[];
    NOT?: ScreenScalarWhereWithAggregatesInput | ScreenScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Screen"> | string;
    workspaceId?: StringWithAggregatesFilter<"Screen"> | string;
    positionX?: FloatWithAggregatesFilter<"Screen"> | number;
    positionY?: FloatWithAggregatesFilter<"Screen"> | number;
    selectedPromptIndex?: IntNullableWithAggregatesFilter<"Screen"> | number | null;
    createdAt?: DateTimeWithAggregatesFilter<"Screen"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"Screen"> | Date | string;
  };

  export type DialogEntryWhereInput = {
    AND?: DialogEntryWhereInput | DialogEntryWhereInput[];
    OR?: DialogEntryWhereInput[];
    NOT?: DialogEntryWhereInput | DialogEntryWhereInput[];
    id?: StringFilter<"DialogEntry"> | string;
    screenId?: StringFilter<"DialogEntry"> | string;
    prompt?: StringFilter<"DialogEntry"> | string;
    html?: StringNullableFilter<"DialogEntry"> | string | null;
    title?: StringNullableFilter<"DialogEntry"> | string | null;
    arrows?: JsonNullableFilter<"DialogEntry">;
    timestamp?: BigIntFilter<"DialogEntry"> | bigint | number;
    createdAt?: DateTimeFilter<"DialogEntry"> | Date | string;
    updatedAt?: DateTimeFilter<"DialogEntry"> | Date | string;
    screen?: XOR<ScreenScalarRelationFilter, ScreenWhereInput>;
  };

  export type DialogEntryOrderByWithRelationInput = {
    id?: SortOrder;
    screenId?: SortOrder;
    prompt?: SortOrder;
    html?: SortOrderInput | SortOrder;
    title?: SortOrderInput | SortOrder;
    arrows?: SortOrderInput | SortOrder;
    timestamp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    screen?: ScreenOrderByWithRelationInput;
  };

  export type DialogEntryWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: DialogEntryWhereInput | DialogEntryWhereInput[];
      OR?: DialogEntryWhereInput[];
      NOT?: DialogEntryWhereInput | DialogEntryWhereInput[];
      screenId?: StringFilter<"DialogEntry"> | string;
      prompt?: StringFilter<"DialogEntry"> | string;
      html?: StringNullableFilter<"DialogEntry"> | string | null;
      title?: StringNullableFilter<"DialogEntry"> | string | null;
      arrows?: JsonNullableFilter<"DialogEntry">;
      timestamp?: BigIntFilter<"DialogEntry"> | bigint | number;
      createdAt?: DateTimeFilter<"DialogEntry"> | Date | string;
      updatedAt?: DateTimeFilter<"DialogEntry"> | Date | string;
      screen?: XOR<ScreenScalarRelationFilter, ScreenWhereInput>;
    },
    "id"
  >;

  export type DialogEntryOrderByWithAggregationInput = {
    id?: SortOrder;
    screenId?: SortOrder;
    prompt?: SortOrder;
    html?: SortOrderInput | SortOrder;
    title?: SortOrderInput | SortOrder;
    arrows?: SortOrderInput | SortOrder;
    timestamp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: DialogEntryCountOrderByAggregateInput;
    _avg?: DialogEntryAvgOrderByAggregateInput;
    _max?: DialogEntryMaxOrderByAggregateInput;
    _min?: DialogEntryMinOrderByAggregateInput;
    _sum?: DialogEntrySumOrderByAggregateInput;
  };

  export type DialogEntryScalarWhereWithAggregatesInput = {
    AND?: DialogEntryScalarWhereWithAggregatesInput | DialogEntryScalarWhereWithAggregatesInput[];
    OR?: DialogEntryScalarWhereWithAggregatesInput[];
    NOT?: DialogEntryScalarWhereWithAggregatesInput | DialogEntryScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"DialogEntry"> | string;
    screenId?: StringWithAggregatesFilter<"DialogEntry"> | string;
    prompt?: StringWithAggregatesFilter<"DialogEntry"> | string;
    html?: StringNullableWithAggregatesFilter<"DialogEntry"> | string | null;
    title?: StringNullableWithAggregatesFilter<"DialogEntry"> | string | null;
    arrows?: JsonNullableWithAggregatesFilter<"DialogEntry">;
    timestamp?: BigIntWithAggregatesFilter<"DialogEntry"> | bigint | number;
    createdAt?: DateTimeWithAggregatesFilter<"DialogEntry"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"DialogEntry"> | Date | string;
  };

  export type WorkspaceCreateInput = {
    id?: string;
    userId: string;
    name?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    screens?: ScreenCreateNestedManyWithoutWorkspaceInput;
  };

  export type WorkspaceUncheckedCreateInput = {
    id?: string;
    userId: string;
    name?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    screens?: ScreenUncheckedCreateNestedManyWithoutWorkspaceInput;
  };

  export type WorkspaceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    screens?: ScreenUpdateManyWithoutWorkspaceNestedInput;
  };

  export type WorkspaceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    screens?: ScreenUncheckedUpdateManyWithoutWorkspaceNestedInput;
  };

  export type WorkspaceCreateManyInput = {
    id?: string;
    userId: string;
    name?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WorkspaceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WorkspaceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ScreenCreateInput = {
    id?: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workspace: WorkspaceCreateNestedOneWithoutScreensInput;
    dialogEntries?: DialogEntryCreateNestedManyWithoutScreenInput;
  };

  export type ScreenUncheckedCreateInput = {
    id?: string;
    workspaceId: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dialogEntries?: DialogEntryUncheckedCreateNestedManyWithoutScreenInput;
  };

  export type ScreenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    workspace?: WorkspaceUpdateOneRequiredWithoutScreensNestedInput;
    dialogEntries?: DialogEntryUpdateManyWithoutScreenNestedInput;
  };

  export type ScreenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    workspaceId?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    dialogEntries?: DialogEntryUncheckedUpdateManyWithoutScreenNestedInput;
  };

  export type ScreenCreateManyInput = {
    id?: string;
    workspaceId: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ScreenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ScreenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    workspaceId?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryCreateInput = {
    id?: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    screen: ScreenCreateNestedOneWithoutDialogEntriesInput;
  };

  export type DialogEntryUncheckedCreateInput = {
    id?: string;
    screenId: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DialogEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    screen?: ScreenUpdateOneRequiredWithoutDialogEntriesNestedInput;
  };

  export type DialogEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    screenId?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryCreateManyInput = {
    id?: string;
    screenId: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DialogEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    screenId?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type ScreenListRelationFilter = {
    every?: ScreenWhereInput;
    some?: ScreenWhereInput;
    none?: ScreenWhereInput;
  };

  export type ScreenOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type WorkspaceUserIdNameCompoundUniqueInput = {
    userId: string;
    name: string;
  };

  export type WorkspaceCountOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type WorkspaceMaxOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type WorkspaceMinOrderByAggregateInput = {
    id?: SortOrder;
    userId?: SortOrder;
    name?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type WorkspaceScalarRelationFilter = {
    is?: WorkspaceWhereInput;
    isNot?: WorkspaceWhereInput;
  };

  export type DialogEntryListRelationFilter = {
    every?: DialogEntryWhereInput;
    some?: DialogEntryWhereInput;
    none?: DialogEntryWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type DialogEntryOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ScreenCountOrderByAggregateInput = {
    id?: SortOrder;
    workspaceId?: SortOrder;
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ScreenAvgOrderByAggregateInput = {
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrder;
  };

  export type ScreenMaxOrderByAggregateInput = {
    id?: SortOrder;
    workspaceId?: SortOrder;
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ScreenMinOrderByAggregateInput = {
    id?: SortOrder;
    workspaceId?: SortOrder;
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type ScreenSumOrderByAggregateInput = {
    positionX?: SortOrder;
    positionY?: SortOrder;
    selectedPromptIndex?: SortOrder;
  };

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, "path">
        >,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, "path">>;

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number;
  };

  export type ScreenScalarRelationFilter = {
    is?: ScreenWhereInput;
    isNot?: ScreenWhereInput;
  };

  export type DialogEntryCountOrderByAggregateInput = {
    id?: SortOrder;
    screenId?: SortOrder;
    prompt?: SortOrder;
    html?: SortOrder;
    title?: SortOrder;
    arrows?: SortOrder;
    timestamp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DialogEntryAvgOrderByAggregateInput = {
    timestamp?: SortOrder;
  };

  export type DialogEntryMaxOrderByAggregateInput = {
    id?: SortOrder;
    screenId?: SortOrder;
    prompt?: SortOrder;
    html?: SortOrder;
    title?: SortOrder;
    timestamp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DialogEntryMinOrderByAggregateInput = {
    id?: SortOrder;
    screenId?: SortOrder;
    prompt?: SortOrder;
    html?: SortOrder;
    title?: SortOrder;
    timestamp?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type DialogEntrySumOrderByAggregateInput = {
    timestamp?: SortOrder;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>,
          Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, "path">
        >,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, "path">>;

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedJsonNullableFilter<$PrismaModel>;
    _max?: NestedJsonNullableFilter<$PrismaModel>;
  };

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedBigIntFilter<$PrismaModel>;
    _min?: NestedBigIntFilter<$PrismaModel>;
    _max?: NestedBigIntFilter<$PrismaModel>;
  };

  export type ScreenCreateNestedManyWithoutWorkspaceInput = {
    create?:
      | XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>
      | ScreenCreateWithoutWorkspaceInput[]
      | ScreenUncheckedCreateWithoutWorkspaceInput[];
    connectOrCreate?:
      | ScreenCreateOrConnectWithoutWorkspaceInput
      | ScreenCreateOrConnectWithoutWorkspaceInput[];
    createMany?: ScreenCreateManyWorkspaceInputEnvelope;
    connect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
  };

  export type ScreenUncheckedCreateNestedManyWithoutWorkspaceInput = {
    create?:
      | XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>
      | ScreenCreateWithoutWorkspaceInput[]
      | ScreenUncheckedCreateWithoutWorkspaceInput[];
    connectOrCreate?:
      | ScreenCreateOrConnectWithoutWorkspaceInput
      | ScreenCreateOrConnectWithoutWorkspaceInput[];
    createMany?: ScreenCreateManyWorkspaceInputEnvelope;
    connect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type ScreenUpdateManyWithoutWorkspaceNestedInput = {
    create?:
      | XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>
      | ScreenCreateWithoutWorkspaceInput[]
      | ScreenUncheckedCreateWithoutWorkspaceInput[];
    connectOrCreate?:
      | ScreenCreateOrConnectWithoutWorkspaceInput
      | ScreenCreateOrConnectWithoutWorkspaceInput[];
    upsert?:
      | ScreenUpsertWithWhereUniqueWithoutWorkspaceInput
      | ScreenUpsertWithWhereUniqueWithoutWorkspaceInput[];
    createMany?: ScreenCreateManyWorkspaceInputEnvelope;
    set?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    disconnect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    delete?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    connect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    update?:
      | ScreenUpdateWithWhereUniqueWithoutWorkspaceInput
      | ScreenUpdateWithWhereUniqueWithoutWorkspaceInput[];
    updateMany?:
      | ScreenUpdateManyWithWhereWithoutWorkspaceInput
      | ScreenUpdateManyWithWhereWithoutWorkspaceInput[];
    deleteMany?: ScreenScalarWhereInput | ScreenScalarWhereInput[];
  };

  export type ScreenUncheckedUpdateManyWithoutWorkspaceNestedInput = {
    create?:
      | XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>
      | ScreenCreateWithoutWorkspaceInput[]
      | ScreenUncheckedCreateWithoutWorkspaceInput[];
    connectOrCreate?:
      | ScreenCreateOrConnectWithoutWorkspaceInput
      | ScreenCreateOrConnectWithoutWorkspaceInput[];
    upsert?:
      | ScreenUpsertWithWhereUniqueWithoutWorkspaceInput
      | ScreenUpsertWithWhereUniqueWithoutWorkspaceInput[];
    createMany?: ScreenCreateManyWorkspaceInputEnvelope;
    set?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    disconnect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    delete?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    connect?: ScreenWhereUniqueInput | ScreenWhereUniqueInput[];
    update?:
      | ScreenUpdateWithWhereUniqueWithoutWorkspaceInput
      | ScreenUpdateWithWhereUniqueWithoutWorkspaceInput[];
    updateMany?:
      | ScreenUpdateManyWithWhereWithoutWorkspaceInput
      | ScreenUpdateManyWithWhereWithoutWorkspaceInput[];
    deleteMany?: ScreenScalarWhereInput | ScreenScalarWhereInput[];
  };

  export type WorkspaceCreateNestedOneWithoutScreensInput = {
    create?: XOR<WorkspaceCreateWithoutScreensInput, WorkspaceUncheckedCreateWithoutScreensInput>;
    connectOrCreate?: WorkspaceCreateOrConnectWithoutScreensInput;
    connect?: WorkspaceWhereUniqueInput;
  };

  export type DialogEntryCreateNestedManyWithoutScreenInput = {
    create?:
      | XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>
      | DialogEntryCreateWithoutScreenInput[]
      | DialogEntryUncheckedCreateWithoutScreenInput[];
    connectOrCreate?:
      | DialogEntryCreateOrConnectWithoutScreenInput
      | DialogEntryCreateOrConnectWithoutScreenInput[];
    createMany?: DialogEntryCreateManyScreenInputEnvelope;
    connect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
  };

  export type DialogEntryUncheckedCreateNestedManyWithoutScreenInput = {
    create?:
      | XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>
      | DialogEntryCreateWithoutScreenInput[]
      | DialogEntryUncheckedCreateWithoutScreenInput[];
    connectOrCreate?:
      | DialogEntryCreateOrConnectWithoutScreenInput
      | DialogEntryCreateOrConnectWithoutScreenInput[];
    createMany?: DialogEntryCreateManyScreenInputEnvelope;
    connect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
  };

  export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  export type WorkspaceUpdateOneRequiredWithoutScreensNestedInput = {
    create?: XOR<WorkspaceCreateWithoutScreensInput, WorkspaceUncheckedCreateWithoutScreensInput>;
    connectOrCreate?: WorkspaceCreateOrConnectWithoutScreensInput;
    upsert?: WorkspaceUpsertWithoutScreensInput;
    connect?: WorkspaceWhereUniqueInput;
    update?: XOR<
      XOR<WorkspaceUpdateToOneWithWhereWithoutScreensInput, WorkspaceUpdateWithoutScreensInput>,
      WorkspaceUncheckedUpdateWithoutScreensInput
    >;
  };

  export type DialogEntryUpdateManyWithoutScreenNestedInput = {
    create?:
      | XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>
      | DialogEntryCreateWithoutScreenInput[]
      | DialogEntryUncheckedCreateWithoutScreenInput[];
    connectOrCreate?:
      | DialogEntryCreateOrConnectWithoutScreenInput
      | DialogEntryCreateOrConnectWithoutScreenInput[];
    upsert?:
      | DialogEntryUpsertWithWhereUniqueWithoutScreenInput
      | DialogEntryUpsertWithWhereUniqueWithoutScreenInput[];
    createMany?: DialogEntryCreateManyScreenInputEnvelope;
    set?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    disconnect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    delete?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    connect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    update?:
      | DialogEntryUpdateWithWhereUniqueWithoutScreenInput
      | DialogEntryUpdateWithWhereUniqueWithoutScreenInput[];
    updateMany?:
      | DialogEntryUpdateManyWithWhereWithoutScreenInput
      | DialogEntryUpdateManyWithWhereWithoutScreenInput[];
    deleteMany?: DialogEntryScalarWhereInput | DialogEntryScalarWhereInput[];
  };

  export type DialogEntryUncheckedUpdateManyWithoutScreenNestedInput = {
    create?:
      | XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>
      | DialogEntryCreateWithoutScreenInput[]
      | DialogEntryUncheckedCreateWithoutScreenInput[];
    connectOrCreate?:
      | DialogEntryCreateOrConnectWithoutScreenInput
      | DialogEntryCreateOrConnectWithoutScreenInput[];
    upsert?:
      | DialogEntryUpsertWithWhereUniqueWithoutScreenInput
      | DialogEntryUpsertWithWhereUniqueWithoutScreenInput[];
    createMany?: DialogEntryCreateManyScreenInputEnvelope;
    set?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    disconnect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    delete?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    connect?: DialogEntryWhereUniqueInput | DialogEntryWhereUniqueInput[];
    update?:
      | DialogEntryUpdateWithWhereUniqueWithoutScreenInput
      | DialogEntryUpdateWithWhereUniqueWithoutScreenInput[];
    updateMany?:
      | DialogEntryUpdateManyWithWhereWithoutScreenInput
      | DialogEntryUpdateManyWithWhereWithoutScreenInput[];
    deleteMany?: DialogEntryScalarWhereInput | DialogEntryScalarWhereInput[];
  };

  export type ScreenCreateNestedOneWithoutDialogEntriesInput = {
    create?: XOR<
      ScreenCreateWithoutDialogEntriesInput,
      ScreenUncheckedCreateWithoutDialogEntriesInput
    >;
    connectOrCreate?: ScreenCreateOrConnectWithoutDialogEntriesInput;
    connect?: ScreenWhereUniqueInput;
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
  };

  export type ScreenUpdateOneRequiredWithoutDialogEntriesNestedInput = {
    create?: XOR<
      ScreenCreateWithoutDialogEntriesInput,
      ScreenUncheckedCreateWithoutDialogEntriesInput
    >;
    connectOrCreate?: ScreenCreateOrConnectWithoutDialogEntriesInput;
    upsert?: ScreenUpsertWithoutDialogEntriesInput;
    connect?: ScreenWhereUniqueInput;
    update?: XOR<
      XOR<
        ScreenUpdateToOneWithWhereWithoutDialogEntriesInput,
        ScreenUpdateWithoutDialogEntriesInput
      >,
      ScreenUncheckedUpdateWithoutDialogEntriesInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatFilter<$PrismaModel> | number;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedFloatFilter<$PrismaModel>;
    _min?: NestedFloatFilter<$PrismaModel>;
    _max?: NestedFloatFilter<$PrismaModel>;
  };

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _avg?: NestedFloatNullableFilter<$PrismaModel>;
    _sum?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedIntNullableFilter<$PrismaModel>;
    _max?: NestedIntNullableFilter<$PrismaModel>;
  };

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null;
    lt?: number | FloatFieldRefInput<$PrismaModel>;
    lte?: number | FloatFieldRefInput<$PrismaModel>;
    gt?: number | FloatFieldRefInput<$PrismaModel>;
    gte?: number | FloatFieldRefInput<$PrismaModel>;
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<
          Required<NestedJsonNullableFilterBase<$PrismaModel>>,
          Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, "path">
        >,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, "path">>;

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
    path?: string[];
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>;
    string_contains?: string | StringFieldRefInput<$PrismaModel>;
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>;
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>;
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null;
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>;
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter;
  };

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>;
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>;
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number;
    _count?: NestedIntFilter<$PrismaModel>;
    _avg?: NestedFloatFilter<$PrismaModel>;
    _sum?: NestedBigIntFilter<$PrismaModel>;
    _min?: NestedBigIntFilter<$PrismaModel>;
    _max?: NestedBigIntFilter<$PrismaModel>;
  };

  export type ScreenCreateWithoutWorkspaceInput = {
    id?: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dialogEntries?: DialogEntryCreateNestedManyWithoutScreenInput;
  };

  export type ScreenUncheckedCreateWithoutWorkspaceInput = {
    id?: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dialogEntries?: DialogEntryUncheckedCreateNestedManyWithoutScreenInput;
  };

  export type ScreenCreateOrConnectWithoutWorkspaceInput = {
    where: ScreenWhereUniqueInput;
    create: XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>;
  };

  export type ScreenCreateManyWorkspaceInputEnvelope = {
    data: ScreenCreateManyWorkspaceInput | ScreenCreateManyWorkspaceInput[];
    skipDuplicates?: boolean;
  };

  export type ScreenUpsertWithWhereUniqueWithoutWorkspaceInput = {
    where: ScreenWhereUniqueInput;
    update: XOR<ScreenUpdateWithoutWorkspaceInput, ScreenUncheckedUpdateWithoutWorkspaceInput>;
    create: XOR<ScreenCreateWithoutWorkspaceInput, ScreenUncheckedCreateWithoutWorkspaceInput>;
  };

  export type ScreenUpdateWithWhereUniqueWithoutWorkspaceInput = {
    where: ScreenWhereUniqueInput;
    data: XOR<ScreenUpdateWithoutWorkspaceInput, ScreenUncheckedUpdateWithoutWorkspaceInput>;
  };

  export type ScreenUpdateManyWithWhereWithoutWorkspaceInput = {
    where: ScreenScalarWhereInput;
    data: XOR<ScreenUpdateManyMutationInput, ScreenUncheckedUpdateManyWithoutWorkspaceInput>;
  };

  export type ScreenScalarWhereInput = {
    AND?: ScreenScalarWhereInput | ScreenScalarWhereInput[];
    OR?: ScreenScalarWhereInput[];
    NOT?: ScreenScalarWhereInput | ScreenScalarWhereInput[];
    id?: StringFilter<"Screen"> | string;
    workspaceId?: StringFilter<"Screen"> | string;
    positionX?: FloatFilter<"Screen"> | number;
    positionY?: FloatFilter<"Screen"> | number;
    selectedPromptIndex?: IntNullableFilter<"Screen"> | number | null;
    createdAt?: DateTimeFilter<"Screen"> | Date | string;
    updatedAt?: DateTimeFilter<"Screen"> | Date | string;
  };

  export type WorkspaceCreateWithoutScreensInput = {
    id?: string;
    userId: string;
    name?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WorkspaceUncheckedCreateWithoutScreensInput = {
    id?: string;
    userId: string;
    name?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type WorkspaceCreateOrConnectWithoutScreensInput = {
    where: WorkspaceWhereUniqueInput;
    create: XOR<WorkspaceCreateWithoutScreensInput, WorkspaceUncheckedCreateWithoutScreensInput>;
  };

  export type DialogEntryCreateWithoutScreenInput = {
    id?: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DialogEntryUncheckedCreateWithoutScreenInput = {
    id?: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DialogEntryCreateOrConnectWithoutScreenInput = {
    where: DialogEntryWhereUniqueInput;
    create: XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>;
  };

  export type DialogEntryCreateManyScreenInputEnvelope = {
    data: DialogEntryCreateManyScreenInput | DialogEntryCreateManyScreenInput[];
    skipDuplicates?: boolean;
  };

  export type WorkspaceUpsertWithoutScreensInput = {
    update: XOR<WorkspaceUpdateWithoutScreensInput, WorkspaceUncheckedUpdateWithoutScreensInput>;
    create: XOR<WorkspaceCreateWithoutScreensInput, WorkspaceUncheckedCreateWithoutScreensInput>;
    where?: WorkspaceWhereInput;
  };

  export type WorkspaceUpdateToOneWithWhereWithoutScreensInput = {
    where?: WorkspaceWhereInput;
    data: XOR<WorkspaceUpdateWithoutScreensInput, WorkspaceUncheckedUpdateWithoutScreensInput>;
  };

  export type WorkspaceUpdateWithoutScreensInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type WorkspaceUncheckedUpdateWithoutScreensInput = {
    id?: StringFieldUpdateOperationsInput | string;
    userId?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryUpsertWithWhereUniqueWithoutScreenInput = {
    where: DialogEntryWhereUniqueInput;
    update: XOR<DialogEntryUpdateWithoutScreenInput, DialogEntryUncheckedUpdateWithoutScreenInput>;
    create: XOR<DialogEntryCreateWithoutScreenInput, DialogEntryUncheckedCreateWithoutScreenInput>;
  };

  export type DialogEntryUpdateWithWhereUniqueWithoutScreenInput = {
    where: DialogEntryWhereUniqueInput;
    data: XOR<DialogEntryUpdateWithoutScreenInput, DialogEntryUncheckedUpdateWithoutScreenInput>;
  };

  export type DialogEntryUpdateManyWithWhereWithoutScreenInput = {
    where: DialogEntryScalarWhereInput;
    data: XOR<DialogEntryUpdateManyMutationInput, DialogEntryUncheckedUpdateManyWithoutScreenInput>;
  };

  export type DialogEntryScalarWhereInput = {
    AND?: DialogEntryScalarWhereInput | DialogEntryScalarWhereInput[];
    OR?: DialogEntryScalarWhereInput[];
    NOT?: DialogEntryScalarWhereInput | DialogEntryScalarWhereInput[];
    id?: StringFilter<"DialogEntry"> | string;
    screenId?: StringFilter<"DialogEntry"> | string;
    prompt?: StringFilter<"DialogEntry"> | string;
    html?: StringNullableFilter<"DialogEntry"> | string | null;
    title?: StringNullableFilter<"DialogEntry"> | string | null;
    arrows?: JsonNullableFilter<"DialogEntry">;
    timestamp?: BigIntFilter<"DialogEntry"> | bigint | number;
    createdAt?: DateTimeFilter<"DialogEntry"> | Date | string;
    updatedAt?: DateTimeFilter<"DialogEntry"> | Date | string;
  };

  export type ScreenCreateWithoutDialogEntriesInput = {
    id?: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workspace: WorkspaceCreateNestedOneWithoutScreensInput;
  };

  export type ScreenUncheckedCreateWithoutDialogEntriesInput = {
    id?: string;
    workspaceId: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ScreenCreateOrConnectWithoutDialogEntriesInput = {
    where: ScreenWhereUniqueInput;
    create: XOR<
      ScreenCreateWithoutDialogEntriesInput,
      ScreenUncheckedCreateWithoutDialogEntriesInput
    >;
  };

  export type ScreenUpsertWithoutDialogEntriesInput = {
    update: XOR<
      ScreenUpdateWithoutDialogEntriesInput,
      ScreenUncheckedUpdateWithoutDialogEntriesInput
    >;
    create: XOR<
      ScreenCreateWithoutDialogEntriesInput,
      ScreenUncheckedCreateWithoutDialogEntriesInput
    >;
    where?: ScreenWhereInput;
  };

  export type ScreenUpdateToOneWithWhereWithoutDialogEntriesInput = {
    where?: ScreenWhereInput;
    data: XOR<
      ScreenUpdateWithoutDialogEntriesInput,
      ScreenUncheckedUpdateWithoutDialogEntriesInput
    >;
  };

  export type ScreenUpdateWithoutDialogEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    workspace?: WorkspaceUpdateOneRequiredWithoutScreensNestedInput;
  };

  export type ScreenUncheckedUpdateWithoutDialogEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    workspaceId?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type ScreenCreateManyWorkspaceInput = {
    id?: string;
    positionX: number;
    positionY: number;
    selectedPromptIndex?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type ScreenUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    dialogEntries?: DialogEntryUpdateManyWithoutScreenNestedInput;
  };

  export type ScreenUncheckedUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    dialogEntries?: DialogEntryUncheckedUpdateManyWithoutScreenNestedInput;
  };

  export type ScreenUncheckedUpdateManyWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    positionX?: FloatFieldUpdateOperationsInput | number;
    positionY?: FloatFieldUpdateOperationsInput | number;
    selectedPromptIndex?: NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryCreateManyScreenInput = {
    id?: string;
    prompt: string;
    html?: string | null;
    title?: string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp: bigint | number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type DialogEntryUpdateWithoutScreenInput = {
    id?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryUncheckedUpdateWithoutScreenInput = {
    id?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DialogEntryUncheckedUpdateManyWithoutScreenInput = {
    id?: StringFieldUpdateOperationsInput | string;
    prompt?: StringFieldUpdateOperationsInput | string;
    html?: NullableStringFieldUpdateOperationsInput | string | null;
    title?: NullableStringFieldUpdateOperationsInput | string | null;
    arrows?: NullableJsonNullValueInput | InputJsonValue;
    timestamp?: BigIntFieldUpdateOperationsInput | bigint | number;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
