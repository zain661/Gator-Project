import { db } from "..";
import { feedFollows, feeds } from "../schema";
import { users } from "../schema";
import { eq, sql } from "drizzle-orm";
export async function createFeed(name, url, userId) {
    const [feed] = await db.insert(feeds).values({
        name, url, userId,
    }).returning();
    return feed;
}
export async function getAllFeeds() {
    const result = await db
        .select({
        feedName: feeds.name,
        feedUrl: feeds.url,
        userName: users.name,
    })
        .from(feeds)
        .innerJoin(users, eq(feeds.userId, users.id));
    return result;
}
export async function getFeedFollowsForUser(userId) {
    return db
        .select({
        feedName: feeds.name,
        userName: users.name,
    })
        .from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId));
}
export async function getFeedByUrl(url) {
    const [feed] = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url));
    if (!feed) {
        throw new Error("feed not found");
    }
    return feed;
}
export async function markFeedFetched(feedId) {
    await db
        .update(feeds)
        .set({
        lastFetchedAt: new Date(),
        updatedAt: new Date(),
    })
        .where(eq(feeds.id, feedId));
}
export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql `${feeds.lastFetchedAt} NULLS FIRST`).limit(1);
    return result;
}
