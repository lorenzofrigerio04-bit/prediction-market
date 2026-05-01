import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

/**
 * Adapter NextAuth ufficiale + `getUserByEmail` case-insensitive.
 *
 * L'adapter stock usa `findUnique({ where: { email } })`: in PostgreSQL le email
 * sono confrontate in modo sensibile al case, mentre OAuth normalizza spesso in
 * minuscolo. Senza questo, OAuth può creare un secondo `User` o sembrare
 * "scollegato" da ciò che vedi in admin.
 */
export function createAuthAdapter(prisma: PrismaClient): Adapter {
  const base = PrismaAdapter(prisma) as Adapter;
  return {
    ...base,
    async getUserByEmail(email) {
      if (!email) return null;
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      return user as AdapterUser | null;
    },
    async createUser(data: Parameters<NonNullable<Adapter["createUser"]>>[0]) {
      const payload =
        typeof data.email === "string"
          ? { ...data, email: data.email.trim().toLowerCase() }
          : data;
      return base.createUser!(payload);
    },
  };
}
