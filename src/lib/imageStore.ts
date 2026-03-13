/**
 * DualDeer Image Store
 * Uploads product images to ImgBB and returns the live URL.
 */

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "4ec26fdb49f1f0c9946d6cc41ed98884";

export async function saveImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url; // The live HTTPS url from imgbb
    }
    throw new Error(data.error?.message || "ImgBB upload failed");
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

// In the new system, images are URLs directly, so these are pass-throughs
export async function getImage(id: string): Promise<string | null> {
  if (!id) return null;
  return id;
}

export async function deleteImage(id: string): Promise<void> {
  // ImgBB API requires special deleting flows which are not available on the free unnamed upload API.
  // We'll leave this as a no-op so the logic in the app doesn't break.
  return;
}

// Sync utils for components that need to render image URLs reactively
export function getCachedImage(id: string): string | null {
  if (!id) return null;
  return id;
}

export async function preloadImage(id: string): Promise<string | null> {
  if (!id) return null;
  return id;
}
