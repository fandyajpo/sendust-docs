#!/usr/bin/env node
/**
 * Downloads the Sendust tree at SENDUST_REF into .sendust/, for hosts that
 * build this site from this repository alone (Vercel, or any CI without a
 * sibling Sendust checkout).
 *
 * The archive is a tarball of the ref itself, so the tree is that ref by
 * construction. A source.json records which ref it came from, and
 * scripts/sync-docs.mjs refuses to render a fetched tree whose recorded ref is
 * not the one being published.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { REPOSITORY } from "./doc-map.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const target = path.join(projectRoot, ".sendust");
const repository = `${REPOSITORY.owner}/${REPOSITORY.name}`;
const ref = process.env.SENDUST_REF?.trim() || REPOSITORY.defaultRef;
const archiveUrl = `https://codeload.github.com/${repository}/tar.gz/${ref}`;

/** The commit a ref points at, when the API answers; the tree does not carry it. */
async function commitFor(repositoryName, refName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repositoryName}/commits/${refName}`, {
      headers: { accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return typeof body.sha === "string" ? body.sha : null;
  } catch {
    return null;
  }
}

console.log(`fetch:docs: downloading ${repository}@${ref}`);

const response = await fetch(archiveUrl, {
  redirect: "follow",
  signal: AbortSignal.timeout(180_000),
});
if (!response.ok) {
  console.error(`fetch:docs: ${archiveUrl} answered ${response.status} ${response.statusText}`);
  process.exit(1);
}

const archive = path.join(tmpdir(), `sendust-${process.pid}.tar.gz`);
writeFileSync(archive, Buffer.from(await response.arrayBuffer()));

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
try {
  execFileSync("tar", ["-xzf", archive, "-C", target, "--strip-components=1"], { stdio: "inherit" });
} finally {
  rmSync(archive, { force: true });
}

if (!existsSync(path.join(target, "docs", "guides"))) {
  console.error("fetch:docs: the archive did not contain docs/guides");
  process.exit(1);
}

const commit = await commitFor(repository, ref);
writeFileSync(
  path.join(target, "source.json"),
  `${JSON.stringify(
    {
      repository,
      ref,
      commit,
      archive: archiveUrl,
      fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    },
    null,
    2,
  )}\n`,
);

console.log(
  `fetch:docs: ${repository}@${ref}${commit ? ` (${commit.slice(0, 8)})` : ""} → ${path.relative(projectRoot, target)}/`,
);
