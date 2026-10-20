export const UPLOAD_FOLDERS = ['blog', 'proekty', 'materialy', 'uslugi', 'o-kompanii', 'kacheli', 'besedki-s-mangalom'] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const CATALOG_IMAGE_DIR = /^(?:otkrytye-besedki|otkrytye-paneli|osteklenie|osteklenie-paneli)\/[a-z0-9-]+$/;

export function isUploadFolder(folder: string): folder is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

/** Папка дворовых рендеров: otkrytye-besedki/b-18, osteklenie/b-21, … */
export function isCatalogImageFolder(folder: string): boolean {
  return CATALOG_IMAGE_DIR.test(folder);
}

export function isAllowedImageFolder(folder: string): boolean {
  return isUploadFolder(folder) || isCatalogImageFolder(folder);
}
