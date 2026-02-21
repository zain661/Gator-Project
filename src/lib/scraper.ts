import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feeds";
import { createPost } from "./db/queries/posts";
import { fetchFeed } from "./db/rss";

export async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) return;

  await markFeedFetched(feed.id);

  const parsedFeed = await fetchFeed(feed.url);

  for (const item of parsedFeed.channel.item) {
    await createPost({
      title: item.title,
      url: item.link,
      description: item.description,
      publishedAt: new Date(item.pubDate),
      feedId: feed.id,
    });
  }
}

