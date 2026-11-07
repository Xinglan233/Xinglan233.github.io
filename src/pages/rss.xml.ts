import type { APIRoute } from 'astro'
import rss from '@astrojs/rss'

import { getBlogCollection, sortMDByDate } from 'astro-pure/server'
import config from 'virtual:config'

export const GET: APIRoute = async (context) => {
  const posts = sortMDByDate(await getBlogCollection())
  return rss({
    title: config.title,
    description: config.description,
    site: context.site!,
    trailingSlash: false,
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}`,
      categories: post.data.tags
    }))
  })
}
