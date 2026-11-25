/** Reconnaît l'hébergeur d'une vidéo collée dans l'admin. */
export const isFacebookVideo = (url: string) => /^https?:\/\/(?:[\w-]+\.)?(facebook\.com|fb\.watch)\//i.test(url);

/** Lecteur Instagram : /reel/ID/ ou /p/ID/ → /reel/ID/embed/. */
export function instagramEmbed(url: string): string | null {
  const match = url.match(/^https?:\/\/(?:www\.)?instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/i);
  return match ? `https://www.instagram.com/${match[1].toLowerCase() === "reels" ? "reel" : match[1]}/${match[2]}/embed/` : null;
}

/** Lecteur YouTube (sans cookie) : watch?v=, youtu.be, shorts, embed. */
export function youtubeEmbed(url: string): string | null {
  const match = url.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

export const isVideoFile = (url: string) => /\.(mp4|webm)(\?|$)/i.test(url) || url.startsWith("/videos/");
