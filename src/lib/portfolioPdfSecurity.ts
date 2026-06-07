import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import {
  MAX_PORTFOLIO_ASSETS,
  MAX_REMOTE_PORTFOLIO_IMAGE_BYTES,
  MAX_REMOTE_PORTFOLIO_IMAGES_BYTES,
  MAX_REMOTE_PORTFOLIO_REDIRECTS,
  REMOTE_PORTFOLIO_IMAGE_TIMEOUT_MS
} from "./securityLimits";
import type { PortfolioImageRef, ProfileDocument } from "./types";

type LookupAddress = { address: string; family: number };
type RemoteImageDependencies = {
  fetcher?: typeof fetch;
  lookupHost?: (hostname: string) => Promise<LookupAddress[]>;
};

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function withTimeout<T>(promise: Promise<T>, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), REMOTE_PORTFOLIO_IMAGE_TIMEOUT_MS);
    promise.then(resolve, reject).finally(() => clearTimeout(timeout));
  });
}

export function isPrivateNetworkAddress(address: string) {
  const value = address.toLowerCase();
  if (value.startsWith("::ffff:")) return isPrivateNetworkAddress(value.slice(7));
  if (isIP(value) === 6) {
    const firstHextet = Number.parseInt(value.split(":")[0] || "0", 16);
    return (
      value === "::1" ||
      value === "::" ||
      (firstHextet & 0xfe00) === 0xfc00 ||
      (firstHextet & 0xffc0) === 0xfe80 ||
      (firstHextet & 0xff00) === 0xff00
    );
  }
  if (isIP(value) === 4) {
    const [a, b] = value.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 2) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0) ||
      a >= 224
    );
  }
  return false;
}

export function isAllowedPortfolioPdfRequest(value: string) {
  if (value.startsWith("about:") || value.startsWith("data:") || value.startsWith("blob:")) return true;
  return false;
}

async function assertPublicHttpsUrl(value: string, lookupHost: NonNullable<RemoteImageDependencies["lookupHost"]>) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error("Remote portfolio images must use public HTTPS URLs.");
  }
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "host.docker.internal" ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error("Remote portfolio image host is not allowed.");
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await withTimeout(lookupHost(hostname), "Remote portfolio image DNS lookup timed out.");
  if (addresses.length === 0 || addresses.some((item) => isPrivateNetworkAddress(item.address))) {
    throw new Error("Remote portfolio image resolved to a private network.");
  }
  return url;
}

async function readLimitedImage(response: Response) {
  const declaredLength = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REMOTE_PORTFOLIO_IMAGE_BYTES) {
    throw new Error("Remote portfolio image is too large.");
  }
  if (!response.body) {
    const result = new Uint8Array(await response.arrayBuffer());
    if (result.byteLength > MAX_REMOTE_PORTFOLIO_IMAGE_BYTES) {
      throw new Error("Remote portfolio image is too large.");
    }
    return result;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_REMOTE_PORTFOLIO_IMAGE_BYTES) {
      throw new Error("Remote portfolio image is too large.");
    }
    chunks.push(value);
  }
  const result = new Uint8Array(received);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return result;
}

async function fetchRemoteImage(
  initialUrl: string,
  dependencies: Required<RemoteImageDependencies>
) {
  let current = initialUrl;
  for (let redirect = 0; redirect <= MAX_REMOTE_PORTFOLIO_REDIRECTS; redirect += 1) {
    const url = await assertPublicHttpsUrl(current, dependencies.lookupHost);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REMOTE_PORTFOLIO_IMAGE_TIMEOUT_MS);
    try {
      const response = await dependencies.fetcher(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "image/png,image/jpeg,image/webp" }
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirect === MAX_REMOTE_PORTFOLIO_REDIRECTS) throw new Error("Too many remote image redirects.");
        current = new URL(location, url).toString();
        continue;
      }
      if (!response.ok) throw new Error("Remote portfolio image request failed.");
      const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!allowedImageTypes.has(contentType)) throw new Error("Remote portfolio image type is not supported.");
      return { contentType, bytes: await readLimitedImage(response) };
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error("Remote portfolio image request failed.");
}

function remoteImageRefs(document: ProfileDocument) {
  return Array.from(new Set(
    document.portfolio.caseStudies.flatMap((study) => [study.coverImage, ...study.gallery])
      .filter((image): image is Extract<PortfolioImageRef, { kind: "url" }> => image?.kind === "url")
      .map((image) => image.url)
  ));
}

export async function resolveRemotePortfolioImages(
  document: ProfileDocument,
  existingAssets: Record<string, string>,
  dependencies: RemoteImageDependencies = {}
) {
  const resolvedDependencies: Required<RemoteImageDependencies> = {
    fetcher: dependencies.fetcher || fetch,
    lookupHost: dependencies.lookupHost || (async (hostname) => lookup(hostname, { all: true }))
  };
  const cloned = structuredClone(document);
  const assets = { ...existingAssets };
  const resolved = new Map<string, string>();
  let totalBytes = 0;

  for (const [index, url] of remoteImageRefs(cloned).slice(0, MAX_PORTFOLIO_ASSETS).entries()) {
    try {
      const image = await fetchRemoteImage(url, resolvedDependencies);
      totalBytes += image.bytes.byteLength;
      if (totalBytes > MAX_REMOTE_PORTFOLIO_IMAGES_BYTES) break;
      const assetId = `remote-image-${index + 1}`;
      assets[assetId] = `data:${image.contentType};base64,${Buffer.from(image.bytes).toString("base64")}`;
      resolved.set(url, assetId);
    } catch {
      // Missing or unsafe remote images intentionally render as placeholders.
    }
  }

  const convert = (image: PortfolioImageRef | undefined): PortfolioImageRef | undefined => {
    if (!image || image.kind === "asset") return image;
    const assetId = resolved.get(image.url);
    return assetId ? { kind: "asset", assetId, alt: image.alt } : undefined;
  };
  cloned.portfolio.caseStudies.forEach((study) => {
    study.coverImage = convert(study.coverImage);
    study.gallery = study.gallery.map(convert).filter((image): image is PortfolioImageRef => Boolean(image));
  });
  return { document: cloned, assets };
}
