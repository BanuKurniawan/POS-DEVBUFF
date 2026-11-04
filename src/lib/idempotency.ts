import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class IdempotencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdempotencyError";
  }
}

export class PayloadMismatchError extends IdempotencyError {
  constructor(key: string) {
    super(
      `Kunci idempotensi '${key}' telah digunakan untuk transaksi lain dengan parameter berbeda (Payload Mismatch).`
    );
    this.name = "PayloadMismatchError";
  }
}

export class ConcurrentProcessingError extends IdempotencyError {
  constructor(key: string) {
    super(
      `Transaksi dengan kunci '${key}' sedang diproses secara bersamaan oleh permintaan lain. Silakan tunggu.`
    );
    this.name = "ConcurrentProcessingError";
  }
}

class ConcurrentInsertError extends Error {
  constructor() {
    super("Concurrent insert detected");
  }
}

/**
 * Computes a deterministic SHA-256 hash of an arbitrary payload.
 * Object keys are sorted recursively to guarantee identical hashes
 * regardless of key ordering.
 */
export function computePayloadHash(payload: unknown): string {
  const canonicalJson = deterministicStringify(payload);
  return crypto.createHash("sha256").update(canonicalJson).digest("hex");
}

function deterministicStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(deterministicStringify).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys.map(
    (k) => JSON.stringify(k) + ":" + deterministicStringify(obj[k])
  );
  return "{" + entries.join(",") + "}";
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const prismaErr = error as { code?: string; message?: string };
  return (
    prismaErr.code === "P2002" ||
    (typeof prismaErr.message === "string" &&
      prismaErr.message.includes("Unique constraint failed"))
  );
}

export interface ExecuteIdempotentOptions<TInput, TResponse> {
  key: string;
  scope: string; // "STOCK_IN" | "CHECKOUT"
  payload: TInput;
  execute: (tx: Prisma.TransactionClient) => Promise<TResponse>;
}

export interface IdempotentResult<TResponse> {
  response: TResponse;
  isReplay: boolean;
}

/**
 * Executes a business operation with database-backed idempotency protection.
 *
 * Guarantees:
 * 1. Safe Retries: If the same key is submitted with the exact same payload, the stored response
 *    is returned without re-executing any side effects (no duplicate stock increments/decrements).
 * 2. Concurrency Safety: If two identical requests hit the server at the exact same millisecond,
 *    database unique constraint on `key` prevents both from running. Exactly one runs, and the other
 *    receives the completed response.
 * 3. Payload Integrity: If the same key is reused with a different payload, it is rejected immediately.
 * 4. Atomic Rollbacks: If the transaction fails, the entire transaction (including the idempotency row)
 *    is rolled back, allowing subsequent retries to proceed.
 */
export async function executeIdempotentTransaction<TInput, TResponse>(
  options: ExecuteIdempotentOptions<TInput, TResponse>
): Promise<IdempotentResult<TResponse>> {
  const { key, scope, payload, execute } = options;

  if (!key || typeof key !== "string" || key.trim().length < 8) {
    throw new IdempotencyError(
      "Idempotency key wajib diisi dan memiliki panjang minimal 8 karakter."
    );
  }

  const trimmedKey = key.trim();
  const requestHash = computePayloadHash(payload);

  // --- 1. FAST PATH: Check if key already completed ---
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: trimmedKey },
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new PayloadMismatchError(trimmedKey);
    }

    if (existing.status === "COMPLETED" && existing.responseBody) {
      return {
        response: JSON.parse(existing.responseBody) as TResponse,
        isReplay: true,
      };
    }

    if (existing.status === "PROCESSING") {
      // In-flight concurrent request: poll briefly (up to ~1.5 seconds)
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 300));
        const refreshed = await prisma.idempotencyKey.findUnique({
          where: { key: trimmedKey },
        });

        if (refreshed?.requestHash !== requestHash) {
          throw new PayloadMismatchError(trimmedKey);
        }

        if (refreshed?.status === "COMPLETED" && refreshed.responseBody) {
          return {
            response: JSON.parse(refreshed.responseBody) as TResponse,
            isReplay: true,
          };
        }
      }

      throw new ConcurrentProcessingError(trimmedKey);
    }
  }

  // --- 2. TRANSACTION PATH: Coordinated execution ---
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Attempt to insert idempotency record with status PROCESSING.
      // Database unique constraint on `key` is our mutex.
      let idempRecord;
      try {
        idempRecord = await tx.idempotencyKey.create({
          data: {
            key: trimmedKey,
            scope,
            requestHash,
            status: "PROCESSING",
          },
        });
      } catch (err: unknown) {
        if (isPrismaUniqueConstraintError(err)) {
          throw new ConcurrentInsertError();
        }
        throw err;
      }

      // Step B: Execute the core business operation (stock update, checkout, etc.)
      const businessResponse = await execute(tx);

      // Step C: Update idempotency record to COMPLETED with serialized response
      await tx.idempotencyKey.update({
        where: { id: idempRecord.id },
        data: {
          status: "COMPLETED",
          responseBody: JSON.stringify(businessResponse),
        },
      });

      return businessResponse;
    });

    return {
      response: result,
      isReplay: false,
    };
  } catch (error: unknown) {
    // If concurrent insert failed because another request committed first:
    if (error instanceof ConcurrentInsertError) {
      // Poll briefly for the winner to finish committing
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 300));
        const winnerRecord = await prisma.idempotencyKey.findUnique({
          where: { key: trimmedKey },
        });

        if (winnerRecord) {
          if (winnerRecord.requestHash !== requestHash) {
            throw new PayloadMismatchError(trimmedKey);
          }

          if (winnerRecord.status === "COMPLETED" && winnerRecord.responseBody) {
            return {
              response: JSON.parse(winnerRecord.responseBody) as TResponse,
              isReplay: true,
            };
          }
        }
      }

      throw new ConcurrentProcessingError(trimmedKey);
    }

    // Pass through genuine business / validation errors
    throw error;
  }
}
