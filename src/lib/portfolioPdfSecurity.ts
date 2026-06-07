import { isIP } from "node:net";

export function isAllowedPortfolioPdfRequest(value: string) {
  if (value.startsWith("about:") || value.startsWith("data:") || value.startsWith("blob:")) return true;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    const unwrappedHostname = hostname.replace(/^\[|\]$/g, "");
    if (
      isIP(unwrappedHostname) > 0 ||
      hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname === "host.docker.internal" ||
      hostname === "metadata.google.internal" ||
      hostname === "169.254.169.254" ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
