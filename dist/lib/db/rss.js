import { XMLParser } from "fast-xml-parser";
export async function fetchFeed(feedUrl) {
    const res = await fetch(feedUrl, {
        headers: {
            "User-Agent": "gator",
        },
    });
    if (!res.ok) {
        throw new Error("failed to fetch feed");
    }
    const xml = await res.text();
    const Parser = new XMLParser();
    const parsed = Parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel) {
        throw new Error("invalid rss feed: missing channel");
    }
    const title = channel.title;
    const link = channel.link;
    const description = channel.description;
    if (!title || !link || !description) {
        throw new Error("invalid rss feed: missing channel metadata");
    }
    let itemsRaw = [];
    if (channel.item) {
        if (Array.isArray(channel.item)) {
            itemsRaw = channel.item;
        }
        else {
            itemsRaw = [channel.item];
        }
    }
    const items = [];
    for (const item of itemsRaw) {
        const itemTitle = item?.title;
        const itemLink = item?.link;
        const itemDescription = item?.description;
        const itemPubDate = item?.pubDate;
        if (!itemTitle ||
            !itemLink ||
            !itemDescription ||
            !itemPubDate) {
            continue;
        }
        items.push({
            title: itemTitle,
            link: itemLink,
            description: itemDescription,
            pubDate: itemPubDate,
        });
    }
    return {
        channel: {
            title,
            link,
            description,
            item: items,
        },
    };
}
