export type FeedPost = {
    id: string;
    title: string;
    author: string;
    realm: string;
    excerpt: string;
    capturedAt: string;
};

export type ArchiveSummary = {
    id: string;
    sourceUrl: string;
    domain: string;
    capturedAt: string;
    merkleRoot: string;
    status: "pending" | "verified" | "disputed";
    postId?: number;
};

export const mockFeed: FeedPost[] = [
    {
        id: "post-001",
        title: "Fishery regulation memo",
        author: "@stalwart",
        realm: "dao",
        excerpt:
            "Drafting proof-of-preservation requirements for whistleblower reports and governance deliberations.",
        capturedAt: "2024-04-01T10:00:00Z",
    },
    {
        id: "post-002",
        title: "X capture: Market rumor thread",
        author: "@observer",
        realm: "gyotaku",
        excerpt:
            "Thread mirrored from x.com to prevent deletion. Includes screenshot + canonical HTML bundle.",
        capturedAt: "2024-04-03T04:30:00Z",
    },
];

export const mockArchives: ArchiveSummary[] = [
    {
        id: "x-920394",
        sourceUrl: "https://x.com/someone/status/123456789",
        domain: "x.com",
        capturedAt: "2024-04-02T08:12:00Z",
        merkleRoot: "0x9d91...c81d",
        status: "verified",
        postId: 1,
    },
    {
        id: "blog-441a",
        sourceUrl: "https://example.blog/post/gyotaku",
        domain: "example.blog",
        capturedAt: "2024-04-05T11:05:00Z",
        merkleRoot: "0x1234...ffff",
        status: "pending",
        postId: 2,
    },
    {
        id: "rumor-set",
        sourceUrl: "https://x.com/rumor/status/987654321",
        domain: "x.com",
        capturedAt: "2024-04-06T19:45:00Z",
        merkleRoot: "0xabcd...8888",
        status: "disputed",
        postId: 3,
    },
];
