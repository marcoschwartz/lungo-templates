const { h } = window.Lungo;

export const loader = { url: "/api/blog/post" };

function QuickStat({ icon, label, value }) {
  return (
    <div class="text-center p-4 rounded-lg bg-stone-900/50 border border-amber-800/10">
      <div class="text-2xl mb-1">{icon}</div>
      <div class="text-lg font-bold text-stone-100">{value}</div>
      <div class="text-xs text-stone-500">{label}</div>
    </div>
  );
}

export default function PostPage({ data, params }) {
  const post = data && data.content ? data.content : data;
  const d = post && post.data ? post.data : post;

  if (!d || !d.title) {
    return (
      <div class="max-w-3xl mx-auto px-4 md:px-6 py-24 text-center">
        <h1 class="text-2xl font-bold text-stone-300 mb-4">Post not found</h1>
        <a href="/blog" class="text-amber-400 hover:text-amber-300 no-underline text-sm">Back to blog</a>
      </div>
    );
  }

  const title = d.title || "";
  const subtitle = d.subtitle || "";
  const category = d.category || "";
  const readTime = d.read_time || "";
  const heroImage = d.featured_image || d.hero_image || "";
  const introduction = d.introduction || "";
  const conclusion = d.conclusion || "";
  const featuredQuote = d.featured_quote || "";
  const date = post.created_at ? post.created_at.substring(0, 10) : "";
  const sections = d.sections || [];
  const keyTakeaways = d.key_takeaways || [];
  const quickStats = d.quick_stats || [];
  const pros = d.pros || [];
  const cons = d.cons || [];
  const tags = d.tags || [];

  return (
    <div class="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <a href="/blog" class="text-sm text-amber-400 hover:text-amber-300 no-underline mb-6 inline-block">Back to blog</a>

      <div class="mb-8">
        {category ? <span class="text-xs font-medium text-amber-400 uppercase tracking-wider">{category}</span> : null}
        <h1 class="text-3xl md:text-4xl font-extrabold text-stone-100 mt-2 mb-3 leading-tight">{title}</h1>
        {subtitle ? <p class="text-lg text-stone-400 mb-3">{subtitle}</p> : null}
        <div class="flex items-center gap-3 text-sm text-stone-500">
          {date ? <span>{date}</span> : null}
          {readTime ? <span>{readTime} read</span> : null}
        </div>
      </div>

      {heroImage ? (
        <div class="rounded-xl overflow-hidden mb-10 border border-amber-800/20">
          <img src={heroImage} alt={title} class="w-full" />
        </div>
      ) : null}

      {quickStats.length > 0 ? (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {quickStats.map(s => <QuickStat icon={s.icon} label={s.label} value={s.value}></div>)}
        </div>
      ) : null}

      {introduction ? (
        <div class="mb-10 text-stone-300 leading-relaxed" dangerouslySetInnerHTML={introduction}></div>
      ) : null}

      {featuredQuote ? (
        <blockquote class="border-l-4 border-amber-500 pl-4 py-2 mb-10 text-stone-300 italic">
          {featuredQuote}
        </blockquote>
      ) : null}

      {keyTakeaways.length > 0 ? (
        <div class="rounded-xl border border-amber-800/20 bg-amber-900/10 p-6 mb-10">
          <h2 class="text-lg font-bold text-stone-100 mb-4">Key Takeaways</h2>
          <div class="space-y-3">
            {keyTakeaways.map(t => (
              <div class="flex gap-3">
                {t.icon ? <span class="text-xl shrink-0">{t.icon}</span> : null}
                <div>
                  <div class="font-medium text-stone-200 text-sm">{t.title}</div>
                  {t.description ? <div class="text-stone-400 text-sm mt-1">{t.description}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {sections.length > 0 ? (
        <div class="space-y-10 mb-10">
          {sections.map(s => (
            <div>
              {s.title ? <h2 class="text-xl font-bold text-stone-100 mb-4">{s.title}</h2> : null}
              {s.content ? <div class="text-stone-300 leading-relaxed" dangerouslySetInnerHTML={s.content}></div> : null}
              {s.image ? (
                <div class="rounded-lg overflow-hidden mt-4 border border-amber-800/20">
                  <img src={s.image} alt={s.title || ""} class="w-full" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {pros.length > 0 || cons.length > 0 ? (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {pros.length > 0 ? (
            <div class="rounded-xl border border-emerald-800/20 bg-emerald-900/10 p-5">
              <h3 class="font-bold text-emerald-400 mb-3">Pros</h3>
              <ul class="space-y-2">
                {pros.map(p => <li class="text-sm text-stone-300 flex gap-2"><span class="text-emerald-400 shrink-0">+</span> {p}</li>)}
              </ul>
            </div>
          ) : null}
          {cons.length > 0 ? (
            <div class="rounded-xl border border-red-800/20 bg-red-900/10 p-5">
              <h3 class="font-bold text-red-400 mb-3">Cons</h3>
              <ul class="space-y-2">
                {cons.map(c => <li class="text-sm text-stone-300 flex gap-2"><span class="text-red-400 shrink-0">-</span> {c}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {conclusion ? (
        <div class="rounded-xl border border-amber-800/20 bg-amber-900/10 p-6 mb-10">
          <h2 class="text-lg font-bold text-stone-100 mb-3">Conclusion</h2>
          <div class="text-stone-300 leading-relaxed" dangerouslySetInnerHTML={conclusion}></div>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div class="flex flex-wrap gap-2 mb-10">
          {tags.map(tag => <span class="px-3 py-1 rounded-full bg-stone-800 text-stone-400 text-xs">{tag}</span>)}
        </div>
      ) : null}

      <div class="border-t border-amber-900/20 pt-8 mt-10">
        <a href="/blog" class="text-amber-400 hover:text-amber-300 no-underline text-sm font-medium">Back to all posts</a>
      </div>
    </div>
  );
}
