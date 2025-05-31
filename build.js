import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { compileFile } from "pug"
import yaml from "yaml"

/**
 * @type {Array<{id: string, url: string, name: string}>}
 */
const members = yaml.parse(readFileSync("members.yaml", "utf8"))

writeFileSync("index.html", compileFile("index.pug")({ members }))

for (const [i, member] of members.entries()) {
  const { id } = member

  mkdirSync(`${id}/prev`, { recursive: true })
  mkdirSync(`${id}/next`, { recursive: true })

  // Main redirection page
  writeFileSync(`${id}/index.html`, redirectionPage(member.url))

  // Next member arrow (allow /next.html and /next)
  const nextMember = members[(i + 1) % members.length]
  writeFileSync(`${id}/next.html`, redirectionPage(nextMember.url))
  writeFileSync(`${id}/next/index.html`, redirectionPage(nextMember.url))

  // Previous member arrow (allow /prev.html and /prev)
  const previousMember = members[(i - 1 + members.length) % members.length]
  writeFileSync(`${id}/prev.html`, redirectionPage(previousMember.url))
  writeFileSync(`${id}/prev/index.html`, redirectionPage(previousMember.url))

  // Button HTML fragment
  writeFileSync(
    `${id}/button.html`,
    compileFile("button.pug")({
      member,
      baseURL: process.env.BASE_URL || "https://n7webring.neocities.org",
    })
  )
}

function redirectionPage(redirectTo) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=${redirectTo}">
    <link rel="canonical" href="${redirectTo}">
    <link rel="icon" href="/favicon.ico">
</head>
<body>
  <p>Redirection vers <a href="${redirectTo}">${redirectTo}</a>...</p>
  <script>
    window.location.href = "${redirectTo}";
  </script>
</body>
</html>`
}
