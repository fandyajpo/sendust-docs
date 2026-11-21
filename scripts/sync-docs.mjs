#!/usr/bin/env node
/**
 * Renders the Sendust documentation into this Starlight site.
 *
 * The documentation's source of truth is fandyajpo/sendust/docs. It is never
 * edited here and never moved out of that repository: this script copies it,
 * adds the frontmatter Starlight needs, and rewrites its links.
 *
 *   1. Resolve the Sendust checkout: SENDUST_PATH, then ../sendust, then
 *      ~/Documents/Personal/sendust.
 *   2. Refuse to run unless that checkout is at SENDUST_REF (default v1.0.1).
 *   3. Copy the documents listed in scripts/doc-map.mjs into src/content/docs/.
 *   4. Inject frontmatter: title from the first H1, description from the first
 *      paragraph, sidebar label and order from the map.
 *   5. Rewrite relative links: into the copied set they become routes on this
 *      site, out of it they become GitHub permalinks at the same ref.
 *   6. Exit non-zero, listing every offending link, if a link would dangle.
 *
 * Usage: node scripts/sync-docs.mjs [--check]
 *   --check  validate and report without writing anything
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPOSITORY, groups, pages } from "./doc-map.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const contentRoot = path.join(projectRoot, "src", "content", "docs");
const provenanceFile = path.join(projectRoot, "src", "synced-docs.json");
const checkOnly = process.argv.slice(2).includes("--check");
const ref = process.env.SENDUST_REF?.trim() || REPOSITORY.defaultRef;
const repoLabel = `${REPOSITORY.owner}/${REPOSITORY.name}`;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`\nsync-docs: ${message}\n`);
  process.exit(1);
}

function warn(message) {
  console.warn(`sync-docs: warning — ${message}`);
}

function expandHome(candidate) {
  if (candidate === "~") return homedir();
  if (candidate.startsWith("~/")) return path.join(homedir(), candidate.slice(2));
  return candidate;
}

function git(directory, gitArgs) {
  return execFileSync("git", ["-C", directory, ...gitArgs], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryGit(directory, gitArgs, fallback) {
  try {
    return git(directory, gitArgs);
  } catch {
    return fallback;
  }
}

function yamlString(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function plainText(value) {
  return value
    .replaceAll(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replaceAll(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replaceAll(/<[^>]+>/g, "")
    .replaceAll(/[*_`~]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function truncate(value, max) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/**
 * A relative link from one page's route to another's.
 * With `trailingSlash: "always"` every page is served as a directory, so the
 * base is the page's own slug, not its parent directory.
 */
function relativeRoute(fromSlug, toSlug) {
  let relative = path.posix.relative(fromSlug, toSlug);
  if (relative === "") return "./";
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return `${relative}/`;
}

/** github-slugger's shape: lowercase, punctuation dropped, spaces to hyphens. */
function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}\s_-]/gu, "")
    .replaceAll(/\s+/g, "-");
}

const FENCE = /^\s{0,3}(?:```|~~~)/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const METADATA = /^\*\*[^*\n]+:\*\*/;

function headingSlugs(markdown) {
  const slugs = new Set();
  const seen = new Map();
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = HEADING.exec(line);
    if (!match) continue;
    const base = slugify(plainText(match[2]));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// 1. The checkout
// ---------------------------------------------------------------------------

function resolveCheckout() {
  const configured = process.env.SENDUST_PATH?.trim();
  if (configured) {
    const directory = path.resolve(projectRoot, expandHome(configured));
    if (!existsSync(path.join(directory, "docs", "guides"))) {
      fail(
        `SENDUST_PATH points at ${directory}, which does not look like a Sendust checkout (no docs/guides).`,
      );
    }
    return directory;
  }

  const candidates = [
    path.resolve(projectRoot, "..", "sendust"),
    path.join(homedir(), "Documents", "Personal", "sendust"),
  ];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "docs", "guides"))) return candidate;
  }

  fail(
    `no Sendust checkout found. Set SENDUST_PATH to one, or clone ${repoLabel} next to this repository:\n` +
      `  git clone https://github.com/${repoLabel}.git ${path.resolve(projectRoot, "..", "sendust")}`,
  );
}

const checkout = resolveCheckout();

// ---------------------------------------------------------------------------
// 2. The ref
// ---------------------------------------------------------------------------

const head = tryGit(checkout, ["rev-parse", "--verify", "HEAD"], "");
if (!head) {
  fail(`${checkout} is not a git checkout, so the documentation cannot be pinned to ${ref}.`);
}

const refCommit = tryGit(checkout, ["rev-parse", "--verify", `${ref}^{commit}`], "");
if (!refCommit) {
  fail(
    `the Sendust checkout at ${checkout} has no ref "${ref}".\n` +
      `  Fetch tags first: git -C ${checkout} fetch --tags`,
  );
}

if (head !== refCommit) {
  const described = tryGit(checkout, ["describe", "--tags", "--always", "--dirty"], head.slice(0, 8));
  fail(
    `the Sendust checkout at ${checkout} is at ${described}, not at ${ref}.\n` +
      `  This site only publishes documentation from a tagged checkout, so nothing was written.\n` +
      `  Fix it with: git -C ${checkout} checkout ${ref}\n` +
      `  Or render another ref: SENDUST_REF=<ref> npm run sync:docs`,
  );
}

const dirtyDocs = tryGit(checkout, ["status", "--porcelain", "--", "docs"], "");
if (dirtyDocs) {
  warn(
    `the Sendust checkout has uncommitted changes under docs/; they are published as if they were ${ref}.`,
  );
}

// ---------------------------------------------------------------------------
// 3. What to copy
// ---------------------------------------------------------------------------

/** Directories under src/content/docs that only ever hold generated Markdown. */
const generatedDirs = new Set(["guide", "api", "decisions", "releases"]);

/** New files are picked up here even before the map lists them. */
const discovery = [
  { directory: "docs/guides", target: "guide", prefix: "", group: "Guides" },
  { directory: "docs/architecture/decisions", target: "decisions", prefix: "00", group: "Decisions" },
];

const entries = [];
const bySource = new Map();

for (const group of groups) {
  group.pages.forEach((slug, index) => {
    const meta = pages[slug];
    if (!meta) {
      fail(
        `scripts/doc-map.mjs: the "${group.label}" group lists "${slug}", which has no entry in "pages".`,
      );
    }

    if (path.posix.basename(`${slug}.md`) !== path.posix.basename(meta.source)) {
      fail(
        `scripts/doc-map.mjs: "${slug}" does not match its source "${meta.source}".\n` +
          `  The file name and the slug must agree so a route cannot move silently.`,
      );
    }

    const absolute = path.join(checkout, meta.source);
    if (!existsSync(absolute)) {
      fail(`"${meta.source}" is listed in scripts/doc-map.mjs but does not exist at ${ref}.`);
    }
    if (bySource.has(absolute)) {
      fail(`"${meta.source}" appears twice in scripts/doc-map.mjs.`);
    }

    const entry = {
      slug,
      source: meta.source,
      absolute,
      label: meta.label,
      description: meta.description,
      order: index + 1,
      group: group.label,
      mapped: true,
    };
    entries.push(entry);
    bySource.set(absolute, entry);
  });
}

const unmapped = [];
for (const rule of discovery) {
  const directory = path.join(checkout, rule.directory);
  if (!existsSync(directory)) continue;
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".md") && file.startsWith(rule.prefix))
    .sort();
  for (const file of files) {
    const source = `${rule.directory}/${file}`;
    const absolute = path.join(checkout, source);
    if (bySource.has(absolute)) continue;
    const entry = {
      slug: `${rule.target}/${file.slice(0, -".md".length)}`,
      source,
      absolute,
      label: "",
      description: undefined,
      order: 900 + unmapped.length,
      group: rule.group,
      mapped: false,
    };
    entries.push(entry);
    bySource.set(absolute, entry);
    unmapped.push(entry);
  }
}

// ---------------------------------------------------------------------------
// 4. Frontmatter and links
// ---------------------------------------------------------------------------

const anchorCache = new Map();
function anchorsFor(absolute) {
  if (!anchorCache.has(absolute)) {
    anchorCache.set(absolute, headingSlugs(readFileSync(absolute, "utf8")));
  }
  return anchorCache.get(absolute);
}

function stripFrontmatter(markdown) {
  const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(markdown);
  return match ? markdown.slice(match[0].length) : markdown;
}

function parseDocument(markdown, entry) {
  const body = stripFrontmatter(markdown).replaceAll("\r\n", "\n");
  const lines = body.split("\n");

  let title = "";
  let titleAt = -1;
  let fenced = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (FENCE.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      titleAt = index;
      title = plainText(match[1]);
      break;
    }
  }

  let description = "";
  if (titleAt !== -1) {
    let buffer = [];
    let inFence = false;
    for (let index = titleAt + 1; index < lines.length; index += 1) {
      const line = lines[index];
      const isFence = FENCE.test(line);
      const isHeading = /^\s{0,3}#{1,6}\s/.test(line);
      const isBlank = line.trim() === "";

      if (isFence || isHeading || isBlank) {
        if (isFence) inFence = !inFence;
        if (!inFence && buffer.length > 0) {
          const candidate = buffer.join(" ").trim();
          if (!METADATA.test(candidate)) {
            description = candidate;
            break;
          }
          buffer = [];
        }
        if (isHeading) break;
        continue;
      }
      if (inFence) continue;
      buffer.push(line.trim());
    }
    if (!description && buffer.length > 0) {
      const candidate = buffer.join(" ").trim();
      if (!METADATA.test(candidate)) description = candidate;
    }
  }

  const plain = plainText(description);
  if (!title) title = entry.label || path.posix.basename(entry.slug);

  return {
    body,
    title,
    description: truncate(plain || entry.description || title, 158),
    usedFallback: plain === "",
  };
}

const inlineLink = /(\[[^\]\n]*\]\(\s*)([^)\s]+)(\s+(?:"[^"\n]*"|'[^'\n]*'))?\s*\)/g;
const referenceLink = /^(\s{0,3}\[[^\]\n]+\]:\s*)(\S+)(.*)$/gm;

/**
 * Resolves one relative link.
 * kind: "external" (left as written), "internal" (a route on this site),
 * "permalink" (a GitHub URL at the same ref).
 */
function resolveTarget(rawTarget, entry, problems, line) {
  const broken = (reason) => {
    problems.push({ file: entry.source, line, target: rawTarget, reason });
    return { href: rawTarget, kind: "external" };
  };

  if (/^[a-z][a-z0-9+.-]*:/i.test(rawTarget) || rawTarget.startsWith("//")) {
    return { href: rawTarget, kind: "external" };
  }
  if (rawTarget.startsWith("#")) return { href: rawTarget, kind: "external" };

  const hashAt = rawTarget.indexOf("#");
  const rawPath = hashAt === -1 ? rawTarget : rawTarget.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : rawTarget.slice(hashAt);
  if (rawPath === "") return { href: rawTarget, kind: "external" };

  let decoded;
  try {
    decoded = decodeURI(rawPath);
  } catch {
    return broken("is not a valid URI path");
  }

  const absolute = decoded.startsWith("/")
    ? path.join(checkout, decoded)
    : path.resolve(path.dirname(entry.absolute), decoded);

  const relative = path.relative(checkout, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return broken(`resolves outside the Sendust repository (${decoded})`);
  }
  if (!existsSync(absolute)) {
    return broken(`has no target at ${ref} (${relative.split(path.sep).join("/")})`);
  }

  const isDirectory = statSync(absolute).isDirectory();
  if (!isDirectory && decoded.endsWith("/")) {
    return broken("points at a file as if it were a directory");
  }

  const mapped = isDirectory ? undefined : bySource.get(path.normalize(absolute));
  if (mapped) {
    if (hash.length > 1) {
      const anchor = decodeURI(hash.slice(1));
      if (!anchorsFor(absolute).has(anchor)) {
        problems.push({
          file: entry.source,
          line,
          target: rawTarget,
          reason: `links to heading "#${anchor}", which ${mapped.slug} does not have`,
        });
      }
    }
    return { href: `${relativeRoute(entry.slug, mapped.slug)}${hash}`, kind: "internal" };
  }

  // Deliberately not published here: point at the same ref in the source repo.
  const encoded = relative.split(path.sep).map(encodeURIComponent).join("/");
  return {
    href: `https://github.com/${repoLabel}/${isDirectory ? "tree" : "blob"}/${ref}/${encoded}${hash}`,
    kind: "permalink",
  };
}

function rewriteLinks(body, entry, problems, tally) {
  const resolve = (target, offset) => {
    const line = body.slice(0, offset).split("\n").length;
    const resolved = resolveTarget(target, entry, problems, line);
    if (resolved.kind === "internal") tally.internal += 1;
    if (resolved.kind === "permalink") tally.permalinks += 1;
    return resolved.href;
  };

  const withInline = body.replace(inlineLink, (...args) => {
    const head = args[1];
    const target = args[2];
    const title = args[3] ?? "";
    const offset = args.at(-2);
    return `${head}${resolve(target, offset)}${title})`;
  });

  return withInline.replace(referenceLink, (...args) => {
    const head = args[1];
    const target = args[2];
    const rest = args[3] ?? "";
    const offset = args.at(-2);
    return `${head}${resolve(target, offset)}${rest}`;
  });
}

function frontmatter(entry, title, description) {
  return [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    "sidebar:",
    `  label: ${yamlString(entry.label || title)}`,
    `  order: ${entry.order}`,
    "---",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// 5. Render
// ---------------------------------------------------------------------------

const problems = [];
const outputs = [];
const fallbacks = [];
const tally = { internal: 0, permalinks: 0 };

for (const entry of entries) {
  const raw = readFileSync(entry.absolute, "utf8");
  const parsed = parseDocument(raw, entry);
  const body = rewriteLinks(parsed.body, entry, problems, tally);

  if (parsed.usedFallback) fallbacks.push(entry.source);
  if (!entry.mapped) {
    entry.label = truncate(parsed.title.split(" — ").at(-1) ?? parsed.title, 40);
    warn(
      `${entry.source} is not listed in scripts/doc-map.mjs; it is published at /${entry.slug}/ but stays out of the sidebar.`,
    );
  }

  outputs.push({
    entry,
    content: `${frontmatter(entry, parsed.title, parsed.description)}${body}`,
  });
}

if (problems.length > 0) {
  const lines = problems
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map((problem) => `  ${problem.file}:${problem.line}  ${problem.target}\n      ${problem.reason}`);
  fail(
    `${problems.length} link${problems.length === 1 ? "" : "s"} would dangle at ${ref}:\n\n${lines.join("\n")}\n\n` +
      "  Nothing was written. Fix the links in the Sendust documentation, or map the missing page.",
  );
}

if (checkOnly) {
  console.log(
    `sync-docs: ${outputs.length} pages from ${repoLabel}@${ref} (${head.slice(0, 8)}) validate; --check wrote nothing.`,
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 6. Write
// ---------------------------------------------------------------------------

for (const directory of generatedDirs) {
  rmSync(path.join(contentRoot, directory), { recursive: true, force: true });
}

for (const output of outputs) {
  const destination = path.join(contentRoot, `${output.entry.slug}.md`);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, output.content);
}

writeFileSync(
  provenanceFile,
  `${JSON.stringify(
    {
      repository: repoLabel,
      ref,
      commit: head,
      syncedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      pages: outputs.length,
    },
    null,
    2,
  )}\n`,
);

const counts = new Map();
for (const entry of entries) counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);

console.log(`sync-docs: ${outputs.length} pages from ${repoLabel}@${ref} (${head.slice(0, 8)})`);
for (const group of groups) {
  console.log(
    `sync-docs:   ${group.label.padEnd(10)} ${String(counts.get(group.label) ?? 0).padStart(3)}`,
  );
}
console.log(
  `sync-docs: ${tally.internal} links routed on this site, ${tally.permalinks} kept as GitHub links`,
);
if (fallbacks.length > 0) {
  console.log(`sync-docs: ${fallbacks.length} pages use their title as the description:`);
  for (const file of fallbacks) console.log(`sync-docs:   ${file}`);
}
