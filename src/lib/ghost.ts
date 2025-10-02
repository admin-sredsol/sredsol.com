import GhostContentAPI from '@tryghost/content-api';

// Create API instance with site credentials
export const ghostClient = new GhostContentAPI({
    url: import.meta.env.GHOST_URL || 'https://blog.sredsol.com', // This is the default URL if your site is running on a local environment
    key: import.meta.env.CONTENT_API_KEY,
    version: 'v5.0',
});

// Fetch blog articles
export async function fetchBlogArticles(limit: number = 5, page: number = 1) {
    const response = await ghostClient.posts
        .browse({
            limit,
            page,
            fields: 'id,feature_image,title,excerpt,slug', // Explicitly request these fields
        })
        .catch((err: unknown) => {
            console.error('Error fetching posts:', err);
            return { posts: [], meta: {} } as { posts: Array<any>; meta: any }; // Return empty fallback data
        });

    const posts = Array.isArray(response) ? response : response.posts || [];
    const meta = response.meta || {};
    return { posts, meta };
}