import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("expire listings", { hours: 1 }, internal.listings.expire, {});

export default crons;
