import { ghostClient } from "../../lib/ghost";

export const prerender = true;

// Fetch all paths for static generation
export async function getStaticPaths() {
  const posts = await ghostClient.posts.browse({ limit: "all" });
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

// Fetch post data for each path
interface Params {
  slug: string;
}

export async function get({ params }: { params: Params }) {
  const post = await ghostClient.posts.read(
    { slug: params.slug },
    { include: ["authors", "tags"], formats: ["html"] },
  );

  return {
    props: {
      post,
    },
  };
}
