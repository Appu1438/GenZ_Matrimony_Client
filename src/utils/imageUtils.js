/* ==========================================================================
   Image helpers for profile photos
   ========================================================================== */

/**
 * Resize / re-encode a photo in the browser before uploading.
 * Phone photos are often 4–12 MB; shrinking them to ~2000px JPEG makes the
 * upload several times faster on mobile data and avoids "file too large" errors.
 *
 * - Respects EXIF rotation.
 * - Flattens transparency onto white (JPEG has no alpha).
 * - Returns the ORIGINAL file if it is already small, if the browser can't
 *   process it, or if re-encoding would not make it smaller.
 */
export async function optimizeImage(
    file,
    {
        maxEdge = 2000,
        quality = 0.85,
        skipBelowBytes = 1.2 * 1024 * 1024,
    } = {}
) {
    let bitmap;

    try {
        if (typeof createImageBitmap !== "function") return file;

        try {
            bitmap = await createImageBitmap(file, {
                imageOrientation: "from-image",
            });
        } catch {
            // Fallback for browsers that don't support imageOrientation options.
            bitmap = await createImageBitmap(file);
        }

        const scale = Math.min(
            1,
            maxEdge / Math.max(bitmap.width, bitmap.height)
        );

        if (scale === 1 && file.size <= skipBelowBytes) {
            return file;
        }

        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) return file;

        context.fillStyle = "#fff";
        context.fillRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", quality);
        });

        if (!blob || blob.size >= file.size) return file;

        const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";

        return new File(
            [blob],
            `${baseName}.jpg`,
            {
                type: "image/jpeg",
                lastModified: Date.now(),
            }
        );
    } catch (error) {
        console.error("Image optimization failed:", error);
        return file;
    } finally {
        bitmap?.close?.();
    }
}

/**
 * Cloudinary delivery URL (auto format + quality) at a given size.
 *   fit "fill"  – crop to exactly width x height (face-aware when `face` is true)
 *   fit "limit" – keep the aspect ratio, never exceed width/height (for full-size viewing)
 * Only rewrites plain "/image/upload/v123/..." URLs; anything else
 * (other hosts, already-transformed URLs) is returned untouched.
 */
const UPLOAD_URL = /^(.*\/image\/upload\/)(v\d+\/.+)$/;

export function photoUrl(url, { width, height, fit = "fill", face = false } = {}) {
    if (!url) return "";

    const match = url.match(UPLOAD_URL);
    if (!match) return url;

    const crop = fit === "limit" ? "c_limit" : face ? "c_fill,g_face" : "c_fill,g_auto";
    const size = [width && `w_${width}`, height && `h_${height}`].filter(Boolean).join(",");

    return `${match[1]}f_auto,q_auto,${crop},${size}/${match[2]}`;
}

/** Square thumbnail (kept for existing callers). */
export function thumbnailUrl(url, size, { face = false } = {}) {
    return photoUrl(url, { width: size, height: size, face });
}