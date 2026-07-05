import { useEffect, useState } from "react";
import { createStorageSlot } from "@docusaurus/theme-common";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedStars {
  count: number;
  fetchedAt: number;
}

function readCache(key: string): CachedStars | null {
  try {
    const raw = createStorageSlot(key).get();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStars;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key: string, count: number) {
  try {
    createStorageSlot(key).set(JSON.stringify({ count, fetchedAt: Date.now() }));
  } catch {
    // localStorage unavailable
  }
}

export function useGithubStars(repo: string): number | null {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const cacheKey = `sandstone.github-stars.${repo}`;
    const cached = readCache(cacheKey);
    if (cached) {
      setStars(cached.count);
      return;
    }

    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.stargazers_count) return;
        setStars(data.stargazers_count);
        writeCache(cacheKey, data.stargazers_count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return stars;
}
