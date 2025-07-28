/**
 * @fileoverview BunnyCDN Storage Server Utilities
 *
 * This module provides server-side utilities for interacting with BunnyCDN's storage service.
 * It includes functions for uploading and deleting files, with proper error handling and
 * type safety. The utilities are designed to work with the BunnyCDN Storage API and handle
 * authentication via access keys.
 *
 * Key features:
 * - File upload to BunnyCDN storage zones
 * - File deletion from storage
 * - Proper error handling and status reporting
 * - Type-safe interfaces for all operations
 * - Support for custom content types and file keys
 *
 * @requires process.env.BUNNY_STORAGE_ZONE - BunnyCDN storage zone name
 * @requires process.env.BUNNY_ACCESS_KEY - BunnyCDN storage access key
 */

/** BunnyCDN storage zone name from environment variables */
const { BUNNY_STORAGE_ZONE, BUNNY_ACCESS_KEY } = process.env;

/** Base hostname for BunnyCDN storage API */
const BASE_HOSTNAME = "storage.bunnycdn.com";

/**
 * Current hostname for storage operations
 * Note: Currently no region specified, may change in future updates
 */
const HOSTNAME = BASE_HOSTNAME;

/** Complete URL for the BunnyCDN storage zone */
const URL = `https://${HOSTNAME}/${BUNNY_STORAGE_ZONE}`;

/**
 * Configuration options for uploading a file to BunnyCDN storage.
 *
 * This interface defines the required and optional parameters for file upload operations.
 * Files are uploaded to the 'images/' directory within the storage zone.
 */
interface UploadFileToStorageOptions {
  /** The file object to upload (browser File API or similar) */
  file: File;
  /**
   * The destination path/filename within the storage zone
   * Will be prefixed with 'images/' automatically
   */
  fileKey: string;
  /**
   * MIME type of the file being uploaded
   * @default 'application/octet-stream'
   */
  contentType?: string;
}

/**
 * Standard response format for storage operations.
 *
 * Provides consistent status and error reporting across all storage functions.
 */
interface StorageOperationResult {
  /** Operation status - 'success' if completed successfully, 'error' if failed */
  status: "success" | "error";
  /** Error message if operation failed, null if successful */
  error: string | null;
}

/**
 * Uploads a file to BunnyCDN storage using the Storage API.
 *
 * This function handles the complete upload process including:
 * - Authentication via access key headers
 * - Content-Type header management
 * - Error handling and status reporting
 * - Automatic path prefixing with 'images/'
 *
 * The file will be uploaded to: `https://storage.bunnycdn.com/{ZONE}/images/{fileKey}`
 *
 * @param {UploadFileToStorageOptions} options - Upload configuration options
 * @param {File} options.file - The file object to upload
 * @param {string} options.fileKey - Destination filename/path within the storage zone
 * @param {string} [options.contentType='application/octet-stream'] - MIME type of the file
 *
 * @returns {Promise<StorageOperationResult>} Promise resolving to operation result
 * @returns {string} returns.status - 'success' or 'error'
 * @returns {string|null} returns.error - Error message if failed, null if successful
 *
 * @throws {Error} May throw network-related errors during fetch operation
 *
 * @example
 * ```typescript
 * // Upload an image file
 * const result = await uploadFileToStorage({
 *   file: imageFile,
 *   fileKey: 'profile-pictures/user-123.jpg',
 *   contentType: 'image/jpeg',
 * });
 *
 * if (result.status === 'success') {
 *   console.log('File uploaded successfully');
 * } else {
 *   console.error('Upload failed:', result.error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Upload with default content type
 * const result = await uploadFileToStorage({
 *   file: documentFile,
 *   fileKey: 'documents/report.pdf',
 * });
 * ```
 */
export async function uploadFIleToStorage(
  options: UploadFileToStorageOptions,
): Promise<StorageOperationResult> {
  const { file, fileKey, contentType = "application/octet-stream" } = options;
  const UPLOAD_URL = `${URL}/images/${fileKey}`;

  const response = await fetch(UPLOAD_URL, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY_ACCESS_KEY,
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    return { status: "error", error: "Failed to upload file" } as const;
  } else {
    return { status: "success", error: null } as const;
  }
}

/**
 * Configuration options for deleting a file from BunnyCDN storage.
 *
 * This interface defines the required parameters for file deletion operations.
 * Files are deleted from the 'images/' directory within the storage zone.
 */
interface DeleteFileFromStorageOptions {
  /**
   * The file path/filename to delete from the storage zone
   * Will be prefixed with 'images/' automatically
   */
  fileKey: string;
}

/**
 * Deletes a file from BunnyCDN storage using the Storage API.
 *
 * This function handles the complete deletion process including:
 * - Authentication via access key headers
 * - Error handling and status reporting
 * - Automatic path prefixing with 'images/'
 *
 * The file will be deleted from: `https://storage.bunnycdn.com/{ZONE}/images/{fileKey}`
 *
 * ⚠️ **Warning**: This operation is irreversible. Deleted files cannot be recovered.
 *
 * @param {DeleteFileFromStorageOptions} options - Deletion configuration options
 * @param {string} options.fileKey - Path/filename of the file to delete
 *
 * @returns {Promise<StorageOperationResult>} Promise resolving to operation result
 * @returns {string} returns.status - 'success' or 'error'
 * @returns {string|null} returns.error - Error message if failed, null if successful
 *
 * @throws {Error} May throw network-related errors during fetch operation
 *
 * @example
 * ```typescript
 * // Delete a specific file
 * const result = await deleteFileFromStorage({
 *   fileKey: 'profile-pictures/user-123.jpg',
 * });
 *
 * if (result.status === 'success') {
 *   console.log('File deleted successfully');
 * } else {
 *   console.error('Deletion failed:', result.error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Delete with error handling
 * try {
 *   const result = await deleteFileFromStorage({
 *     fileKey: 'temp/upload-123.png',
 *   });
 *
 *   if (result.status === 'error') {
 *     // Handle deletion failure (file might not exist)
 *     console.warn('File deletion failed:', result.error);
 *   }
 * } catch (error) {
 *   // Handle network or other errors
 *   console.error('Network error during deletion:', error);
 * }
 * ```
 */
export async function deleteFileFromStorage(
  options: DeleteFileFromStorageOptions,
): Promise<StorageOperationResult> {
  const { fileKey } = options;
  const DELETE_URL = `${URL}/images/${fileKey}`;

  const response = await fetch(DELETE_URL, {
    method: "DELETE",
    headers: {
      AccessKey: BUNNY_ACCESS_KEY,
    },
  });

  if (!response.ok) {
    return { status: "error", error: "Failed to delete file" } as const;
  } else {
    return { status: "success", error: null } as const;
  }
}
