import * as cheerio from "cheerio";

export interface ParsedBookmark {
  url: string;
  title: string;
  favicon?: string;
  tags: string[];
}

/**
 * Parse HTML bookmarks file (Netscape format)
 * Extracts folder hierarchy as tags
 */
export function parseBookmarksHTML(html: string): ParsedBookmark[] {
  const $ = cheerio.load(html);
  const bookmarks: ParsedBookmark[] = [];

  // Recursive function to parse bookmarks and their folder hierarchy
  function parseNode(
    node: any,
    folderPath: string[] = [],
    isRootLevel = false
  ) {
    const $node = $(node);

    $node.children().each((_, child) => {
      const $child = $(child);

      // If it's a folder (H3)
      if (child.name === "h3") {
        const folderName = $child.text().trim().toLowerCase();

        // Skip root "Bookmarks" folder and "Bookmarks bar" variants
        const isRootBookmarksFolder =
          isRootLevel &&
          (folderName === "bookmarks" ||
            folderName === "bookmarks bar" ||
            folderName === "barre personnelle");

        // Find the next DL sibling for nested content
        const $nextDL = $child.next("dl");
        if ($nextDL.length > 0) {
          if (isRootBookmarksFolder) {
            // Skip adding this folder to the path, just recurse
            parseNode($nextDL[0], folderPath, false);
          } else {
            parseNode($nextDL[0], [...folderPath, folderName], false);
          }
        }
      }
      // If it's a DL, recurse into it
      else if (child.name === "dl") {
        parseNode(child, folderPath, isRootLevel);
      }
      // If it's a DT, check for links or folders
      else if (child.name === "dt") {
        // Check for nested folders first (H3 tags)
        const $h3 = $child.children("h3").first();
        if ($h3.length > 0) {
          const folderName = $h3.text().trim().toLowerCase();
          const isRootBookmarksFolder =
            isRootLevel &&
            (folderName === "bookmarks" ||
              folderName === "bookmarks bar" ||
              folderName === "barre personnelle");

          const $nextDL = $h3.next("dl");
          if ($nextDL.length > 0) {
            if (isRootBookmarksFolder) {
              parseNode($nextDL[0], folderPath, false);
            } else {
              parseNode($nextDL[0], [...folderPath, folderName], false);
            }
          }
        }
        // Otherwise check for direct bookmark links (A tags)
        else {
          const $link = $child.children("a").first();
          if ($link.length > 0) {
            const url = $link.attr("href");
            const title = $link.text().trim();
            const icon = $link.attr("icon");

            if (url && title) {
              bookmarks.push({
                url,
                title,
                favicon: icon || undefined,
                tags: folderPath,
              });
            }
          }
        }
      }
    });
  }

  // Start parsing from the root
  parseNode($("body")[0] || $("html")[0], [], true);

  return bookmarks;
}

/**
 * Generate HTML bookmarks file (Netscape format)
 * Creates folder hierarchy based on tags
 */
export function generateBookmarksHTML(
  bookmarks: Array<{
    url: string;
    title: string;
    favicon?: string | null;
    description?: string | null;
    tags: string[];
  }>
): string {
  const timestamp = Math.floor(Date.now() / 1000);

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks from AdaTools</H1>
<DL><p>
`;

  // Group bookmarks by their tag path
  const bookmarksByPath = new Map<string, typeof bookmarks>();

  bookmarks.forEach((bookmark) => {
    const pathKey = bookmark.tags.join("/") || "_root";
    if (!bookmarksByPath.has(pathKey)) {
      bookmarksByPath.set(pathKey, []);
    }
    bookmarksByPath.get(pathKey)!.push(bookmark);
  });

  // Sort paths to handle nested folders correctly
  const sortedPaths = Array.from(bookmarksByPath.keys()).sort();

  // Track which folders we've already opened
  const openFolders = new Set<string>();

  function generateFolderStructure(
    path: string[],
    bookmarksInPath: typeof bookmarks,
    indent: number
  ): string {
    let result = "";
    const indentStr = "    ".repeat(indent);

    if (path.length > 0) {
      // Open folders for this path
      for (let i = 0; i < path.length; i++) {
        const folderPath = path.slice(0, i + 1).join("/");
        if (!openFolders.has(folderPath)) {
          const folderIndent = "    ".repeat(indent + i);
          result += `${folderIndent}<DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${escapeHtml(path[i])}</H3>\n`;
          result += `${folderIndent}<DL><p>\n`;
          openFolders.add(folderPath);
        }
      }
    }

    // Add bookmarks
    const bookmarkIndent = "    ".repeat(indent + path.length);
    bookmarksInPath.forEach((bookmark) => {
      const iconAttr = bookmark.favicon ? ` ICON="${bookmark.favicon}"` : "";
      result += `${bookmarkIndent}<DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${timestamp}"${iconAttr}>${escapeHtml(bookmark.title)}</A>\n`;
    });

    return result;
  }

  // Process all paths
  sortedPaths.forEach((pathKey) => {
    const bookmarksInPath = bookmarksByPath.get(pathKey)!;
    const path = pathKey === "_root" ? [] : pathKey.split("/");
    html += generateFolderStructure(path, bookmarksInPath, 1);
  });

  // Close all opened folders
  const allPaths = Array.from(openFolders)
    .map((p) => p.split("/"))
    .sort((a, b) => b.length - a.length); // Close deepest first

  allPaths.forEach((path) => {
    const indent = "    ".repeat(path.length);
    html += `${indent}</DL><p>\n`;
  });

  html += `</DL><p>`;

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
