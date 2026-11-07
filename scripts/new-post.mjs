import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const slug = process.argv[2]
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('用法：npm run new -- my-first-post（小写英文、数字与短横线）')
  process.exit(1)
}
const directory = resolve('src/content/blog')
mkdirSync(directory, { recursive: true })
const path = resolve(directory, `${slug}.md`)
if (existsSync(path)) {
  console.error('文章已存在，不会覆盖：' + path)
  process.exit(1)
}
const date = new Date().toISOString().slice(0, 10)
writeFileSync(
  path,
  `---\ntitle: '文章标题'\ndescription: '一句话介绍这篇文章。'\npublishDate: ${date}\ntags: ['随笔']\ndraft: true\ncomment: false\n---\n\n从这里开始写作。\n`
)
console.log('已创建草稿：' + path)
