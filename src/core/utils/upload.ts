export const createPreviewMedia = (media: File | Blob) =>
  Object.assign(media, {
    preview: URL.createObjectURL(media),
  });
