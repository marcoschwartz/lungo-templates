const { h, useState, useEffect } = window.Lungo;

export const metadata = {
  title: "Blog — MySite",
  description: "Articles and tutorials"
};

export const loader = { url: "/api/blog" };

function PostCard({ post }) {
  const data = post.data || post;
  const title = data.title || "Untitled";
  const description = data.description || data.subtitle || "";
  const slug = post.slug || data.slug || "";
  const date = post.created_at || post.date || "";
  const displayDate = date ? date.substring(0, 10) : "";
  const category = data.category || "";
  const readTime = data.read_time || "";

  return (
    <a href={"/" + slug} class="block rounded-xl border border-amber-800/20 bg-amber-900/10 p-6 hover:bg-amber-900/20 hover:border-amber-700/30 transition-all no-underline group">
      {category ? (
        <span class="text-xs font-medium text-amber-400 uppercase tracking-wider">{category}</span>
      ) : null}
      <h2 class="text-lg font-semibold text-stone-100 mt-2 mb-2 group-hover:text-amber-300 transition-colors">{title}</h2>
      {description ? <p class="text-sm text-stone-400 leading-relaxed mb-3">{description}</p> : null}
      <div class="flex items-center gap-3 text-xs text-stone-500">
        {displayDate ? <span>{displayDate}</span> : null}
        {readTime ? <span>{readTime} read</span> : null}
      </div>
    </a>
  );
}

export default function BlogPage({ data }) {
  const posts = data && data.content ? data.content : (Array.isArray(data) ? data : []);

  return (
    <div class="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div class="mb-12">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Blog</span>
        </h1>
        <p class="text-lg text-stone-400">Articles, tutorials, and updates.</p>
      </div>

      {posts.length > 0 ? (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => <PostCard post={post} />)}
        </div>
      ) : (
        <div class="text-center py-16 rounded-xl border border-amber-800/20 border-dashed">
          <p class="text-stone-500">No posts yet. Create content in OmniKit CMS.</p>
        </div>
      )}
    </div>
  );
}
