import { db } from "..";
import { feedFollows, posts } from "../schema"; // ملف الـ schema للجدول
import { eq, inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";

export type PostRow = {
  id?: string;
  title: string;
  url: string;
  description?: string;
  publishedAt?: Date;
  feedId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function createPost(post: PostRow) {
  try {
    const existing = await db.select().from(posts).where(eq(posts.url, post.url));
  if (existing.length > 0) {
    // موجود مسبقًا، نتجاهله
    console.log(`Post already exists: ${post.url}`);
    return existing[0];
  }

  // لو مش موجود، أضف جديد
  return db.insert(posts).values(post).returning();
  } catch (err) {
    if ((err as any).code === "23505") { 
      // duplicate key
      return null;
    }
    throw err;
  }
}

export async function getPostsForUser(userId: string, limit = 2) {
  const follows = await db.select({ feedId: feedFollows.feedId })
                          .from(feedFollows)
                          .where(eq(feedFollows.userId, userId));

  const feedIds = follows.map(f => f.feedId);

  return db.select()
           .from(posts)
           .where(inArray(posts.feedId, feedIds))
           .orderBy(desc(posts.publishedAt)) // ✅ استخدم desc()
           .limit(limit);
}
