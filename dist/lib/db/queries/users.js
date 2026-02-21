import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";
export async function createUser(name) {
    const [result] = await db
        .insert(users)
        .values({ name })
        .returning();
    return result;
}
export async function deleteAllUsers() {
    await db.delete(users);
}
export async function getUsers() {
    return await db.select().from(users);
}
export async function getUserByName(name) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.name, name));
    return user;
}
