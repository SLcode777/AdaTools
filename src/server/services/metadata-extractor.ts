import ogs from "open-graph-scraper";

export interface ExtractedMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

export async function extractMetadata(
  url: string
): Promise<ExtractedMetadata> {
  try {
    // Validate URL format
    new URL(url);

    const options = {
      url,
      timeout: 5000, // 5 second timeout
      retry: 2,
    };

    const { result } = await ogs(options);

    console.log("OGS result:", JSON.stringify(result, null, 2));

    // Extract metadata with fallbacks
    const title =
      result.ogTitle || result.twitterTitle || result.dcTitle || undefined;

    const description =
      result.ogDescription ||
      result.twitterDescription ||
      result.dcDescription ||
      undefined;

    // Handle image - can be array or string
    let image: string | undefined;
    if (result.ogImage && Array.isArray(result.ogImage)) {
      image = result.ogImage[0]?.url;
    } else if (result.twitterImage && Array.isArray(result.twitterImage)) {
      image = result.twitterImage[0]?.url;
    }

    // Handle favicon
    const favicon = result.favicon || generateFaviconUrl(url);

    const metadata: ExtractedMetadata = {
      title,
      description,
      image,
      favicon,
    };

    console.log("Extracted metadata:", metadata);

    return metadata;
  } catch (error) {
    // Return empty metadata on error - allow manual entry
    console.error("Metadata extraction failed:", error);
    return {
      title: undefined,
      description: undefined,
      image: undefined,
      favicon: generateFaviconUrl(url),
    };
  }
}

function generateFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch {
    return "";
  }
}
