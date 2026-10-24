/**
 * Conversion Word SERVEUR uniquement — mammoth (.docx → HTML).
 * Module séparé de convert.ts pour ne jamais embarquer mammoth dans le
 * bundle navigateur (import « server-only » garanti par le compilateur).
 */
import "server-only";

/** Fichier .docx (octets) → HTML éditable dans l'éditeur. */
export async function docxToHtmlServer(bytes: Uint8Array): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.convertToHtml(
    { buffer: Buffer.from(bytes) },
    {
      styleMap: [
        "p[style-name='Quote'] => blockquote:fresh",
        "p[style-name='Intense Quote'] => blockquote:fresh",
        "r[style-name='Strong'] => strong",
      ],
      includeDefaultStyleMap: true,
    }
  );
  return result.value || "<p></p>";
}
