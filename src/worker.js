import adminApp from "./apps/admin.js";

const INTERNAL_PORTAL_PREFIX = "/_portal";
const ADMIN_PREFIX = "/admin";
const LEGACY_ROOTS = Object.freeze([
  "/auth", "/converter", "/courses", "/dashboard", "/editor", "/feed",
  "/habits", "/pdf", "/todo", "/vault",
]);
export const PROTECTION_DECODE_LIMITS = Object.freeze({ passes: 8, length: 32 * 1024 });

function hasPathPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isHexPair(value, index) {
  return index + 1 < value.length
    && /[0-9a-f]/i.test(value[index])
    && /[0-9a-f]/i.test(value[index + 1]);
}

function printableAsciiCharacter(hexByte) {
  const value = Number.parseInt(hexByte, 16);
  return value >= 0x20 && value <= 0x7e ? String.fromCharCode(value) : null;
}

function decodeProtectionPercentLayer(pathname) {
  let decoded = "";
  let changed = false;
  for (let index = 0; index < pathname.length;) {
    if (pathname[index] !== "%" || !isHexPair(pathname, index + 1)) {
      decoded += pathname[index];
      index += 1;
      continue;
    }

    // `%25252561` is the normal shape produced by repeatedly encoding `%61`.
    // Collapse that chain in this single scan so nesting depth cannot turn the
    // guard into repeated whole-string work. Controls stay encoded because URL
    // reparsing would otherwise erase them and manufacture a protected root.
    let byteIndex = index + 1;
    while (pathname.slice(byteIndex, byteIndex + 2).toLowerCase() === "25") byteIndex += 2;
    const nestedPercent = byteIndex > index + 1;
    const character = isHexPair(pathname, byteIndex)
      ? printableAsciiCharacter(pathname.slice(byteIndex, byteIndex + 2))
      : null;

    if (character !== null) {
      decoded += character;
      index = byteIndex + 2;
      changed = true;
    } else if (nestedPercent) {
      decoded += "%";
      index = byteIndex;
      changed = true;
    } else {
      decoded += pathname.slice(index, index + 3);
      index += 3;
    }
  }
  return { decoded, changed };
}

function canonicalProtectionPathname(pathname) {
  const segments = [];
  // ASSETS canonicalizes repeated separators before later redirect/decoding
  // steps. Do the same before resolving dot segments; reversing this order
  // changes which segment `..` removes.
  for (const segment of pathname.replace(/\\/g, "/").split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment.toLowerCase());
  }
  return `/${segments.join("/")}`;
}

function plausiblyEncodedProtectedPath(pathname) {
  if (!pathname.includes("%")) return false;
  const preview = canonicalProtectionPathname(decodeProtectionPercentLayer(pathname).decoded);
  if (isProtectedPath(preview)) return true;

  const routeClues = [...LEGACY_ROOTS, INTERNAL_PORTAL_PREFIX].map((root) => root.slice(1));
  const firstSegment = preview.toLowerCase().split("/", 2)[1] ?? "";
  return routeClues.some((clue) => {
    let clueIndex = 0;
    let index = 0;
    while (index < firstSegment.length && clueIndex < clue.length) {
      if (firstSegment[index] === clue[clueIndex]) {
        clueIndex += 1;
        index += 1;
      } else if (firstSegment[index] === "%") {
        const character = isHexPair(firstSegment, index + 1)
          ? printableAsciiCharacter(firstSegment.slice(index + 1, index + 3))
          : null;
        if (character === clue[clueIndex]) clueIndex += 1;
        else if (character !== "%") return false;
        index += character === null ? 1 : 3;
      } else {
        return false;
      }
    }
    return clueIndex === clue.length && index === firstSegment.length;
  });
}

function isProtectedPath(pathname) {
  return hasPathPrefix(pathname, INTERNAL_PORTAL_PREFIX) || isRemovedLegacyPath(pathname);
}

export function inspectProtectedPath(pathname) {
  let candidate = canonicalProtectionPathname(pathname);
  const maximumPasses = pathname.length > PROTECTION_DECODE_LIMITS.length ? 1 : PROTECTION_DECODE_LIMITS.passes;
  let exhausted = false;

  for (let iteration = 0; iteration < maximumPasses; iteration += 1) {
    const { decoded, changed } = decodeProtectionPercentLayer(candidate);
    if (!changed) return { blocked: isProtectedPath(candidate), decodePasses: iteration + 1 };
    candidate = canonicalProtectionPathname(decoded);
    exhausted = iteration === maximumPasses - 1;
  }

  return {
    blocked: isProtectedPath(candidate) || exhausted && plausiblyEncodedProtectedPath(candidate),
    decodePasses: maximumPasses,
  };
}

function isRemovedLegacyPath(pathname) {
  return LEGACY_ROOTS.some((prefix) => hasPathPrefix(pathname, prefix));
}

async function publicNotFound(request, env) {
  const notFoundUrl = new URL("/404.html", request.url);
  const headers = new Headers();
  for (const name of ["accept", "accept-language"]) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  const assetResponse = await env.ASSETS.fetch(new Request(notFoundUrl, { headers }));
  return new Response(request.method === "HEAD" ? null : assetResponse.body, {
    status: 404,
    statusText: "Not Found",
    headers: assetResponse.headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === `${ADMIN_PREFIX}/client.js`) {
      return env.ASSETS.fetch(request);
    }
    if (hasPathPrefix(url.pathname, ADMIN_PREFIX)) {
      return adminApp.fetch(request, env, ctx);
    }
    if (inspectProtectedPath(url.pathname).blocked) {
      return publicNotFound(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
