import { getSession } from "next-auth/react";

export async function getServerSession() {
  const session = await getSession();
  return session;
}
