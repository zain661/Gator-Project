import { readConfig, setUser } from "./config.js";
import { createUser, getUserByName } from "./lib/db/queries/users";
import { deleteAllUsers, getUsers } from "./lib/db/queries/users";
import { createFeed, getAllFeeds, getFeedByUrl, getFeedFollowsForUser } from "./lib/db/queries/feeds.js";
import { createFeedFollow, deleteFeedFollowByUserAndUrl } from "./lib/db/queries/feed_follows.js";
import { scrapeFeeds } from "./lib/scraper.js";
import { getPostsForUser } from "./lib/db/queries/posts.js";
async function handlerLogin(cmdName, ...args) {
    if (args.length === 0) {
        throw new Error("username is required");
    }
    const username = args[0];
    const user = await getUserByName(username);
    if (!user) {
        throw new Error("user does not exist");
    }
    setUser(username);
    console.log(`User set to ${username}`);
}
export async function handlerUsers() {
    const allUsers = await getUsers();
    const config = await readConfig();
    for (const user of allUsers) {
        if (user.name === config.currentUserName) {
            console.log(`* ${user.name} (current)`);
        }
        else {
            console.log(`* ${user.name}`);
        }
    }
}
async function handlerReset(cmdName, ...args) {
    await deleteAllUsers();
    console.log("Database reset successfully");
}
async function handlerRegister(cmdName, ...args) {
    if (args.length === 0) {
        throw new Error("username is required");
    }
    const name = args[0];
    const existing = await getUserByName(name);
    if (existing) {
        throw new Error("user already exists");
    }
    const user = await createUser(name);
    setUser(name);
    console.log("User created");
    console.log(user);
}
// async function handlerAgg(cmdName: string, ...args: string[]) {
//   const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
//   console.log(JSON.stringify(feed, null, 2));
// }
function parseDuration(durationStr) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = durationStr.match(regex);
    if (!match) {
        throw new Error("invalid duration");
    }
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
        case "ms": return value;
        case "s": return value * 1000;
        case "m": return value * 60 * 1000;
        case "h": return value * 60 * 60 * 1000;
    }
    throw new Error("invalid duration");
}
export async function handlerBrowse(cmdName, user, ...args) {
    const limit = args.length > 0 ? parseInt(args[0]) : 2;
    const posts = await getPostsForUser(user.id, limit);
    for (const post of posts) {
        console.log(`${post.title} (${post.url})`);
    }
}
async function handlerAgg(cmdName, ...args) {
    if (args.length < 1) {
        throw new Error("usage: agg <time_between_reqs>");
    }
    const timeBetweenRequests = parseDuration(args[0]);
    console.log(`Collecting feeds every ${args[0]}`);
    scrapeFeeds().catch(console.error);
    const interval = setInterval(() => {
        scrapeFeeds().catch(console.error);
    }, timeBetweenRequests);
    await new Promise((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });
}
async function handlerGetAllFeeds(cmdName) {
    const allFeeds = await getAllFeeds();
    for (const row of allFeeds) {
        console.log(`${row.feedName} | ${row.feedUrl} | created by ${row.userName}`);
    }
}
export async function handlerFollow(cmdName, user, ...args) {
    if (args.length < 1) {
        throw new Error("usage: follow <url>");
    }
    const url = args[0];
    const feed = await getFeedByUrl(url);
    const follow = await createFeedFollow(user.id, feed.id);
    console.log(`${follow.userName} is now following ${follow.feedName}`);
}
async function handlerAddFeed(cmdName, user, ...args) {
    if (args.length < 2) {
        throw new Error("name and url are required");
    }
    const name = args[0];
    const url = args[1];
    // const config = readConfig();
    // if (!config.currentUserName) {
    //   throw new Error("no user logged in");
    // }
    // const user = await getUserByName(config.currentUserName);
    // if (!user) {
    //   throw new Error("current user does not exist");
    // }
    const feed = await createFeed(name, url, user.id);
    const result = await createFeedFollow(user.id, feed.id);
    console.log(result.feedName, result.userName);
    //printFeed(feed, user);
}
export async function handlerFollowing(cmdName, user) {
    const follows = await getFeedFollowsForUser(user.id);
    for (const f of follows) {
        console.log(f.feedName);
    }
}
async function handlerUnfollow(cmdName, user, ...args) {
    if (args.length < 1) {
        throw new Error("usage: unfollow <url>");
    }
    const url = args[0];
    await deleteFeedFollowByUserAndUrl(user.id, url);
    console.log(`unfollowed ${url}`);
}
export function printFeed(feed, user) {
    console.log(`Feed: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${user.name}`);
}
function registerCommand(registry, cmdName, handler) {
    registry[cmdName] = handler;
}
async function runCommand(registry, cmdName, ...args) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unknown command: ${cmdName}`);
    }
    await handler(cmdName, ...args);
}
export function middlewareLoggedIn(handler) {
    return async (cmdName, ...args) => {
        const config = await readConfig();
        if (!config.currentUserName) {
            throw new Error("no user logged in");
        }
        const user = await getUserByName(config.currentUserName);
        if (!user) {
            throw new Error(`User ${config.currentUserName} not found`);
        }
        return handler(cmdName, user, ...args);
    };
}
async function main() {
    const registry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "feeds", handlerGetAllFeeds);
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Not enough arguments");
        process.exit(1);
    }
    const cmdName = args[0];
    const cmdArgs = args.slice(1);
    try {
        await runCommand(registry, cmdName, ...cmdArgs);
        process.exit(0);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        else {
            console.error("Unknown error");
        }
        process.exit(1);
    }
}
main();
function handleError(err) {
    if (err instanceof Error) {
        console.error(err.message);
    }
    else {
        console.error(err);
    }
}
