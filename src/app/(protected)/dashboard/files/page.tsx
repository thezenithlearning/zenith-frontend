'use client';

import { useMemo, useRef, useState } from 'react';
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  File,
  FileArchive,
  FileText,
  Folder,
  Grid,
  HardDrive,
  Image as ImageIcon,
  List,
  Loader2,
  RefreshCw,
  Search,
  Timer,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

import { useFile } from '../../../../features/file/hooks/useFile';
import type { IFile } from '../../../../features/file/api/fileApi';
import { MAX_UPLOAD_BYTES, uploadFileWithProgress, waitForFileReady } from '../../../../features/file/api/uploadWithProgress';

interface SeoFormState {
  title: string;
  description: string;
  altText: string;
  caption: string;
  /** Comma separated, e.g. "banner, ib physics, 2026". */
  tags: string;
}

const EMPTY_FORM: SeoFormState = {
  title: '',
  description: '',
  altText: '',
  caption: '',
  tags: '',
};

/** The File Manager replaces a file through a single request, so keep that to a sensible size. */
const MAX_REPLACE_BYTES = 100 * 1024 * 1024;

type TypeFilter = 'all' | 'image' | 'video' | 'document' | 'other';

const TYPE_FILTERS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'PDFs & documents' },
  { value: 'other', label: 'Other' },
];

const matchesType = (file: IFile, filter: TypeFilter): boolean => {
  if (filter === 'all') return true;
  if (filter === 'image') return file.resourceType === 'image';
  if (filter === 'video') return file.resourceType === 'video';
  const isDocument = file.assetType === 'document' || Boolean(file.mimeType?.includes('pdf'));
  return filter === 'document' ? isDocument : file.resourceType === 'raw' && !isDocument;
};

/** "digital_marketing-banner.final.webp" -> "digital marketing banner.final" */
const titleFromFileName = (fileName: string): string =>
  fileName
    .replace(/\.[^./\\]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Mirrors the backend slug so the admin can preview the final URL name. */
const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '') || 'file';

const extensionOf = (fileName: string): string => {
  const match = /\.[^./\\]+$/.exec(fileName);
  return match ? match[0].toLowerCase() : '';
};

interface UploadStats {
  loaded: number;
  total: number;
  /** Smoothed bytes per second. */
  speed: number;
  startedAt: number;
  now: number;
}

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${Number((bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2))} ${units[index]}`;
};

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '--';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const getDisplayName = (file: IFile): string => file.originalName;

const getImageAlt = (file: IFile): string =>
  file.altText?.trim() || file.originalName;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as {
      status?: number | string;
      originalStatus?: number;
      data?: { message?: string };
      message?: string;
      error?: string;
    };

    // The proxy/backend answered with an HTML page (e.g. nginx 413/502/504)
    // instead of JSON, which surfaces as a raw "SyntaxError ... not valid JSON".
    if (apiError.status === 'PARSING_ERROR' || /not valid JSON|Unexpected token '</.test(apiError.error || apiError.message || '')) {
      const code = apiError.originalStatus ? ` (HTTP ${apiError.originalStatus})` : '';
      return `The server returned an error page instead of a response${code}. The backend may be restarting or a proxy limit was hit. Please try again.`;
    }

    return apiError.data?.message || apiError.message || apiError.error || fallback;
  }

  return fallback;
};

export default function FilesPage() {
  const {
    files,
    isLoading,
    error,
    useGetFiles,
    updateFile,
    deleteFile,
  } = useFile();
  const { refetch } = useGetFiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFile, setEditingFile] = useState<IFile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<File | null>(null);
  const [form, setForm] = useState<SeoFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sampleRef = useRef<{ time: number; loaded: number; speed: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedUpload(null);
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    resetForm();
  };

  const openEditModal = (file: IFile) => {
    setActionError(null);
    setEditingFile(file);
    setForm({
      title: file.title || '',
      description: file.description || '',
      altText: file.altText || '',
      caption: file.caption || '',
      tags: file.tags?.join(', ') || '',
    });
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditingFile(null);
    resetForm();
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUpload) {
      setActionError('Choose a file before uploading.');
      return;
    }

    if (selectedUpload.size > MAX_UPLOAD_BYTES) {
      setActionError(`Files must be ${formatFileSize(MAX_UPLOAD_BYTES)} or smaller.`);
      return;
    }

    const body = new FormData();
    body.append('file', selectedUpload);
    if (form.title.trim()) body.append('title', form.title.trim());
    if (form.description.trim()) body.append('description', form.description.trim());
    if (form.altText.trim()) body.append('altText', form.altText.trim());
    if (form.caption.trim()) body.append('caption', form.caption.trim());
    if (form.tags.trim()) body.append('tags', form.tags.trim());

    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = Date.now();
    sampleRef.current = { time: startedAt, loaded: 0, speed: 0 };

    try {
      setUploading(true);
      setActionError(null);
      setUploadStats({ loaded: 0, total: selectedUpload.size, speed: 0, startedAt, now: startedAt });

      const uploadResult = await uploadFileWithProgress(
        body,
        ({ loaded, total }) => {
          const now = Date.now();
          const sample = sampleRef.current;
          if (!sample) return;

          const elapsed = (now - sample.time) / 1000;
          // Sample at most ~4x/second and smooth with a moving average.
          if (elapsed >= 0.25 || loaded >= total) {
            const instant = elapsed > 0 ? (loaded - sample.loaded) / elapsed : sample.speed;
            const speed = sample.speed === 0 ? instant : sample.speed * 0.7 + instant * 0.3;
            sampleRef.current = { time: now, loaded, speed };
            setUploadStats({ loaded, total, speed, startedAt, now });
          }
        },
        controller.signal,
      );
      // Bytes are on the server; wait while it finishes copying to storage.
      await waitForFileReady(uploadResult.data, controller.signal);
      await refetch();
      setShowUploadModal(false);
      resetForm();
      showSuccess('File and SEO metadata uploaded successfully.');
    } catch (uploadFailure: unknown) {
      if ((uploadFailure as { cancelled?: boolean })?.cancelled) {
        setActionError('Upload cancelled.');
      } else if (
        selectedUpload &&
        (sampleRef.current?.loaded ?? 0) >= selectedUpload.size * 0.99 &&
        (uploadFailure as { status?: number })?.status === undefined
      ) {
        // The bytes were sent but the connection dropped before the server
        // answered, so the file may still have been saved.
        await refetch();
        setActionError(
          'All data was sent, but the connection dropped before the server confirmed it. The file may already be saved — check the list below. If it is missing, the server needs the latest backend deploy and higher proxy timeouts.',
        );
      } else {
        setActionError(getErrorMessage(uploadFailure, 'Failed to upload file.'));
      }
    } finally {
      abortRef.current = null;
      setUploading(false);
      setUploadStats(null);
    }
  };

  const cancelUpload = () => abortRef.current?.abort();

  const handleMetadataUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingFile) return;

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('description', form.description.trim());
    body.append('altText', form.altText.trim());
    body.append('caption', form.caption.trim());
    body.append('tags', form.tags.trim());

    if (selectedUpload) {
      if (selectedUpload.size > MAX_REPLACE_BYTES) {
        setActionError(
          `A replacement file must be ${formatFileSize(MAX_REPLACE_BYTES)} or smaller. Upload larger files as a new file.`,
        );
        return;
      }
      body.append('file', selectedUpload);
    }

    try {
      setSaving(true);
      setActionError(null);
      await updateFile({ id: editingFile._id, body });
      await refetch();
      setEditingFile(null);
      resetForm();
      showSuccess(selectedUpload ? 'File replaced and metadata updated.' : 'File SEO metadata updated successfully.');
    } catch (updateFailure: unknown) {
      setActionError(getErrorMessage(updateFailure, 'Failed to update file.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setActionError(null);
      await deleteFile(deleteId);
      await refetch();
      setShowDeleteModal(false);
      setDeleteId(null);
      showSuccess('File deleted successfully.');
    } catch (deleteFailure: unknown) {
      setActionError(getErrorMessage(deleteFailure, 'Failed to delete file.'));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const unit = 1024;
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(unit));
    return `${Number((bytes / unit ** unitIndex).toFixed(2))} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getFileIcon = (mimeType: string, resourceType: string) => {
    if (resourceType === 'image') return <ImageIcon className="h-6 w-6" />;
    if (resourceType === 'video') return <Video className="h-6 w-6" />;
    if (mimeType?.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) {
      return <FileArchive className="h-6 w-6" />;
    }
    return <File className="h-6 w-6" />;
  };

  const getFileColor = (mimeType: string, resourceType: string) => {
    if (resourceType === 'image') return 'from-purple-100 to-pink-100 text-purple-600';
    if (resourceType === 'video') return 'from-blue-100 to-cyan-100 text-blue-600';
    if (mimeType?.includes('pdf')) return 'from-red-100 to-rose-100 text-red-600';
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) {
      return 'from-amber-100 to-orange-100 text-amber-600';
    }
    return 'from-gray-100 to-slate-100 text-gray-600';
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard.');
  };

  const folders = useMemo(
    () => Array.from(new Set(files.map((file) => file.folder).filter(Boolean))).sort(),
    [files],
  );

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return files.filter((file) => {
      if (!matchesType(file, typeFilter)) return false;
      if (folderFilter !== 'all' && file.folder !== folderFilter) return false;
      if (!query) return true;

      return [
        getDisplayName(file),
        file.originalName,
        file.title,
        file.description,
        file.altText,
        file.caption,
        file.mimeType,
        file.format,
        file.folder,
        file.slug,
        file.tags?.join(' '),
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [files, searchQuery, typeFilter, folderFilter]);

  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const images = files.filter((file) => file.resourceType === 'image').length;
  const videos = files.filter((file) => file.resourceType === 'video').length;
  const hasActiveFilter = Boolean(searchQuery.trim()) || typeFilter !== 'all' || folderFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Folder className="h-6 w-6 text-indigo-600" />
            File Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${filteredFiles.length === totalFiles ? totalFiles : `${filteredFiles.length} of ${totalFiles}`} files`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button id="dashboard-files-grid-view-button"
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button id="dashboard-files-list-view-button"
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button id="dashboard-files-upload-button"
            type="button"
            onClick={() => {
              setActionError(null);
              resetForm();
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Folder className="h-5 w-5 text-indigo-600" />} label="Total Files" value={String(totalFiles)} iconClass="bg-indigo-100" />
        <StatCard icon={<HardDrive className="h-5 w-5 text-purple-600" />} label="Total Size" value={formatFileSize(totalSize)} iconClass="bg-purple-100" />
        <StatCard icon={<ImageIcon className="h-5 w-5 text-pink-600" />} label="Images" value={String(images)} iconClass="bg-pink-100" />
        <StatCard icon={<Video className="h-5 w-5 text-blue-600" />} label="Videos" value={String(videos)} iconClass="bg-blue-100" />
      </div>

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">{success}</p>
        </div>
      )}

      {(error || actionError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error || actionError}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filename, title, tags, folder, alt text, or format..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TYPE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            aria-label="Filter by folder"
            value={folderFilter}
            onChange={(event) => setFolderFilter(event.target.value)}
            className="max-w-[14rem] rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
          <button id="dashboard-files-refresh-files-button"
            type="button"
            onClick={() => void refetch()}
            aria-label="Refresh files"
            className="rounded-xl border border-gray-300 p-2.5 text-gray-500 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {isLoading && files.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Folder className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No files found</h3>
            <p className="mt-1 text-gray-500">
              {hasActiveFilter ? 'Try adjusting your search or filters.' : 'Upload your first SEO-friendly file.'}
            </p>
            {!hasActiveFilter && (
              <button id="dashboard-files-upload-file-button"
                type="button"
                onClick={() => {
                  setActionError(null);
                  resetForm();
                  setShowUploadModal(true);
                }}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                Upload File
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredFiles.map((file) => (
              <div
                key={file._id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all hover:shadow-lg"
              >
                <div className="relative aspect-square bg-white">
                  {file.resourceType === 'image' ? (
                    <img
                      src={file.url}
                      alt={getImageAlt(file)}
                      title={file.title || undefined}
                      className="h-full w-full object-cover"
                    />
                  ) : file.resourceType === 'video' ? (
                    <video className="h-full w-full object-cover" src={file.url} />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getFileColor(file.mimeType, file.resourceType)}`}>
                      {getFileIcon(file.mimeType, file.resourceType)}
                    </div>
                  )}

                  <div className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    {file.format?.toUpperCase() || 'FILE'}
                  </div>
                  {file.status === 'processing' && (
                    <div className="absolute right-2 top-2 rounded-lg bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">Processing</div>
                  )}
                  {file.status === 'failed' && (
                    <div className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-medium text-white" title={file.errorMessage}>Failed</div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button id={`dashboard-files-preview-${file._id}-button`} type="button" onClick={() => { setSelectedFile(file); setShowPreviewModal(true); }} className="rounded-lg bg-white p-2 text-gray-700 hover:bg-gray-100" title="Preview">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button id={`dashboard-files-edit-seo-metadata-${file._id}-button`} type="button" onClick={() => openEditModal(file)} className="rounded-lg bg-white p-2 text-indigo-700 hover:bg-gray-100" title="Edit SEO metadata">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button id={`dashboard-files-grid-copy-url-${file._id}-button`} type="button" onClick={() => void copyToClipboard(file.url)} className="rounded-lg bg-white p-2 text-gray-700 hover:bg-gray-100" title="Copy URL">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button id={`dashboard-files-delete-${file._id}-button`} type="button" onClick={() => confirmDelete(file._id)} className="rounded-lg bg-white p-2 text-red-600 hover:bg-gray-100" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-medium text-gray-900" title={getDisplayName(file)}>
                    {getDisplayName(file)}
                  </p>
                  {file.title && <p className="mt-1 truncate text-xs text-gray-500">{file.title}</p>}
                  <p className="mt-1 truncate text-xs text-gray-400" title={file.folder}>{formatFileSize(file.size)} · {file.folder}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">File</th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 md:table-cell">SEO title</th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell">Size</th>
                  <th className="hidden px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 xl:table-cell">Uploaded</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <tr key={file._id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getFileColor(file.mimeType, file.resourceType)}`}>
                          {getFileIcon(file.mimeType, file.resourceType)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-indigo-600">{getDisplayName(file)}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-400" title={file.storageKey}>{file.folder} · {file.storageKey}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden max-w-xs px-4 py-3.5 md:table-cell">
                      <p className="truncate text-sm text-gray-700">{file.title || '—'}</p>
                      <p className="truncate text-xs text-gray-400">{file.altText || 'No alt text'}</p>
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-gray-500 lg:table-cell">{formatFileSize(file.size)}</td>
                    <td className="hidden px-4 py-3.5 xl:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(file.uploadedAt || file.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <ActionButton id={`dashboard-files-table-preview-${file._id}-button`} title="Preview" onClick={() => { setSelectedFile(file); setShowPreviewModal(true); }}><Eye className="h-4 w-4" /></ActionButton>
                        <ActionButton id={`dashboard-files-table-edit-seo-${file._id}-button`} title="Edit SEO metadata" onClick={() => openEditModal(file)}><Edit className="h-4 w-4" /></ActionButton>
                        <ActionButton id={`dashboard-files-table-copy-url-${file._id}-button`} title="Copy URL" onClick={() => void copyToClipboard(file.url)}><Copy className="h-4 w-4" /></ActionButton>
                        <ActionButton id={`dashboard-files-table-open-new-tab-${file._id}-button`} title="Open in new tab" onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}><ExternalLink className="h-4 w-4" /></ActionButton>
                        <ActionButton id={`dashboard-files-table-delete-${file._id}-button`} title="Delete" onClick={() => confirmDelete(file._id)} danger><Trash2 className="h-4 w-4" /></ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUploadModal && (
        <SeoFileModal
          heading="Upload SEO-friendly file"
          submitLabel="Upload file"
          busyLabel="Uploading..."
          form={form}
          setForm={setForm}
          isBusy={uploading}
          uploadStats={uploadStats}
          onCancelUpload={cancelUpload}
          selectedUpload={selectedUpload}
          onFileChange={(file) => {
            setActionError(null);
            setSelectedUpload(file);
            // Auto-detect the file name; the admin can keep it or rename it.
            setForm({ ...EMPTY_FORM, title: file ? titleFromFileName(file.name) : '' });

            if (file && file.size > MAX_UPLOAD_BYTES) {
              setActionError(
                `Files must be ${formatFileSize(MAX_UPLOAD_BYTES)} or smaller. Selected file is ${formatFileSize(file.size)}.`,
              );
            }
          }}
          onClose={closeUploadModal}
          onSubmit={handleUpload}
          showFilePicker
        />
      )}

      {editingFile && (
        <SeoFileModal
          heading="Edit file SEO metadata"
          submitLabel="Save changes"
          busyLabel="Saving..."
          form={form}
          setForm={setForm}
          isBusy={saving}
          selectedUpload={selectedUpload}
          onFileChange={(file) => {
            setActionError(null);
            setSelectedUpload(file);
          }}
          showReplacePicker
          onClose={closeEditModal}
          onSubmit={handleMetadataUpdate}
          helperText="Editing metadata never changes the file URL. Replacing the file uploads a new object, so its URL changes and the old file is removed. To use a different file name in the URL, upload the file again with the new name."
        />
      )}

      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`rounded-lg bg-gradient-to-br p-2 ${getFileColor(selectedFile.mimeType, selectedFile.resourceType)}`}>
                  {getFileIcon(selectedFile.mimeType, selectedFile.resourceType)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">{getDisplayName(selectedFile)}</h3>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)} • {selectedFile.format?.toUpperCase()}</p>
                </div>
              </div>
              <button id="dashboard-files-close-preview-button" type="button" onClick={() => { setShowPreviewModal(false); setSelectedFile(null); }} className="rounded-lg p-2 transition-colors hover:bg-gray-100" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto bg-gray-50 p-4">
              {selectedFile.resourceType === 'image' ? (
                <img src={selectedFile.url} alt={getImageAlt(selectedFile)} title={selectedFile.title || undefined} className="mx-auto max-h-[55vh] max-w-full object-contain" />
              ) : selectedFile.resourceType === 'video' ? (
                <video src={selectedFile.url} controls className="mx-auto max-h-[55vh] max-w-full" />
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className={`rounded-2xl bg-gradient-to-br p-6 ${getFileColor(selectedFile.mimeType, selectedFile.resourceType)}`}>
                    {getFileIcon(selectedFile.mimeType, selectedFile.resourceType)}
                  </div>
                  <p className="mt-4 text-gray-500">Preview is not available for this file type.</p>
                  <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Open file</a>
                </div>
              )}
            </div>

            <div className="max-h-[25vh] overflow-auto border-t border-gray-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Metadata label="Original name" value={selectedFile.originalName} />
                <Metadata label="SEO title" value={selectedFile.title || '—'} />
                <Metadata label="Alt text" value={selectedFile.altText || '—'} />
                <Metadata label="Description" value={selectedFile.description || '—'} wide />
                <Metadata label="Caption" value={selectedFile.caption || '—'} wide />
                <Metadata label="Folder" value={selectedFile.folder || '—'} />
                <Metadata label="Tags" value={selectedFile.tags?.length ? selectedFile.tags.join(', ') : '—'} />
                {selectedFile.width && selectedFile.height && (
                  <Metadata label="Dimensions" value={`${selectedFile.width} × ${selectedFile.height}px`} />
                )}
                <Metadata label="Storage key" value={selectedFile.storageKey ?? ''} wide />
                <Metadata label="Type" value={selectedFile.mimeType} />
                <Metadata label="Size" value={formatFileSize(selectedFile.size)} />
                <Metadata label="Uploaded" value={formatDate(selectedFile.uploadedAt || selectedFile.createdAt)} />
                <div>
                  <p className="text-xs text-gray-500">URL</p>
                  <button id="dashboard-files-copy-url-button" type="button" onClick={() => void copyToClipboard(selectedFile.url)} className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700">
                    Copy URL <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3"><AlertCircle className="h-6 w-6 text-red-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete File</h2>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="mb-6 text-gray-600">The file and its SEO metadata will be permanently removed from storage.</p>
            <div className="flex gap-3">
              <button id="dashboard-files-cancel-button" type="button" onClick={() => { setShowDeleteModal(false); setDeleteId(null); }} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button id="dashboard-files-confirm-delete-button" type="button" onClick={() => void handleDelete()} disabled={deleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                {deleting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Deleting...</span> : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeoFileModal({
  heading,
  submitLabel,
  busyLabel,
  form,
  setForm,
  isBusy,
  selectedUpload,
  uploadStats,
  onCancelUpload,
  onFileChange,
  onClose,
  onSubmit,
  showFilePicker = false,
  showReplacePicker = false,
  helperText,
}: {
  heading: string;
  submitLabel: string;
  busyLabel: string;
  form: SeoFormState;
  setForm: Dispatch<SetStateAction<SeoFormState>>;
  isBusy: boolean;
  selectedUpload?: File | null;
  uploadStats?: UploadStats | null;
  onCancelUpload?: () => void;
  onFileChange?: (file: File | null) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  showFilePicker?: boolean;
  showReplacePicker?: boolean;
  helperText?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
            <p className="mt-1 text-sm text-gray-500">Use descriptive metadata so images are accessible and easier to discover.</p>
          </div>
          <button id="dashboard-files-close-button" type="button" onClick={onClose} disabled={isBusy} className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <fieldset disabled={isBusy} className="min-w-0 space-y-5 border-0 p-5">
          {showFilePicker && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">File <span className="text-red-500">*</span></span>
              <input
                type="file"
                required
                onChange={(event) => onFileChange?.(event.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {selectedUpload && <span className="mt-1 block text-xs text-gray-500">Selected: {selectedUpload.name}</span>}
              <span className="mt-1 block text-xs text-gray-500">Images, PDFs, videos, and other files. Maximum size: 1 GB per file.</span>
            </label>
          )}

          {showReplacePicker && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Replace file <span className="font-normal text-gray-400">(optional)</span></span>
              <input
                type="file"
                onChange={(event) => onFileChange?.(event.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <span className="mt-1 block text-xs text-gray-500">Must be the same kind of file (image, video, PDF…). Up to 100 MB.</span>
            </label>
          )}

          <div className="grid gap-5 sm:grid-cols-2">

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">File title / name <span className="font-normal text-gray-400">(optional)</span></span>
              <input
                type="text"
                maxLength={200}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Digital Marketing Course Banner"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {showFilePicker && selectedUpload && (
                <span className="mt-1 block break-all text-xs text-gray-500">
                  Detected from the file — keep it or rename it. URL name:{' '}
                  <span className="font-medium text-indigo-700">
                    {slugify(form.title || titleFromFileName(selectedUpload.name))}-xxxxxxxx{extensionOf(selectedUpload.name)}
                  </span>
                </span>
              )}
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Alt text <span className="font-normal text-gray-400">(optional)</span></span>
            <input
              type="text"
              maxLength={300}
              value={form.altText}
              onChange={(event) => setForm((current) => ({ ...current, altText: event.target.value }))}
              placeholder="Students learning digital marketing in an online class"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-xs text-gray-500">Describe the image for accessibility when applicable.</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Description <span className="font-normal text-gray-400">(optional)</span></span>
            <textarea
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Explain where this file is used and what it represents."
              className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-right text-xs text-gray-400">{form.description.length}/1000</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Caption <span className="font-normal text-gray-400">(optional)</span></span>
            <textarea
              rows={3}
              maxLength={500}
              value={form.caption}
              onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))}
              placeholder="Caption displayed alongside the file or image."
              className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-right text-xs text-gray-400">{form.caption.length}/500</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Tags <span className="font-normal text-gray-400">(optional)</span></span>
            <input
              type="text"
              maxLength={300}
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="banner, ib physics, 2026"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="mt-1 block text-xs text-gray-500">Comma separated. Used to find files quickly.</span>
          </label>

          {helperText && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{helperText}</p>}
        </fieldset>

        {uploadStats && (
          <div className="px-5 pb-5">
            <UploadProgressPanel stats={uploadStats} fileName={selectedUpload?.name} onCancel={onCancelUpload} />
          </div>
        )}

        <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-5">
          <button id="dashboard-files-seo-modal-cancel-button" type="button" onClick={onClose} disabled={isBusy} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50">Cancel</button>
          <button id="dashboard-files-seo-modal-submit-button" type="submit" disabled={isBusy} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isBusy ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{busyLabel}</span> : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function UploadProgressPanel({
  stats,
  fileName,
  onCancel,
}: {
  stats: UploadStats;
  fileName?: string;
  onCancel?: () => void;
}) {
  const percent = stats.total > 0 ? Math.min(100, (stats.loaded / stats.total) * 100) : 0;
  const remaining = Math.max(0, stats.total - stats.loaded);
  const eta = stats.speed > 0 ? remaining / stats.speed : NaN;
  const elapsed = (stats.now - stats.startedAt) / 1000;
  const sending = percent < 100;

  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
            {sending ? 'Uploading…' : 'Finalizing on server…'}
          </p>
          {fileName && <p className="mt-0.5 truncate text-xs text-indigo-700/80" title={fileName}>{fileName}</p>}
        </div>
        <span className="text-2xl font-bold tabular-nums text-indigo-700">{percent.toFixed(percent >= 100 ? 0 : 1)}%</span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white shadow-inner"
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-[width] duration-300 ${sending ? '' : 'animate-pulse'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="text-indigo-700/70">Uploaded</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">{formatBytes(stats.loaded)} <span className="font-normal text-gray-500">/ {formatBytes(stats.total)}</span></dd>
        </div>
        <div>
          <dt className="text-indigo-700/70">Remaining</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">{formatBytes(remaining)}</dd>
        </div>
        <div>
          <dt className="text-indigo-700/70">Speed</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">{stats.speed > 0 ? `${formatBytes(stats.speed)}/s` : '--'}</dd>
        </div>
        <div>
          <dt className="text-indigo-700/70">Time left</dt>
          <dd className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums text-gray-900">
            <Timer className="h-3.5 w-3.5 text-indigo-600" />
            {sending ? formatDuration(eta) : '…'}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-indigo-200/70 pt-3 text-xs text-indigo-800/80">
        <span>Elapsed {formatDuration(elapsed)}{Number.isFinite(eta) && sending ? ` · Total ≈ ${formatDuration(elapsed + eta)}` : ''}</span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium text-red-600 hover:bg-red-50">
            Cancel upload
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, iconClass }: { icon: ReactNode; label: string; value: string; iconClass: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconClass}`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="truncate text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ id, children, title, onClick, danger = false }: { id: string; children: ReactNode; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button id={id} type="button" onClick={onClick} title={title} className={`rounded-lg p-1.5 text-gray-400 transition-colors ${danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}>
      {children}
    </button>
  );
}

function Metadata({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2 lg:col-span-2' : undefined}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="break-words font-medium text-gray-700">{value}</p>
    </div>
  );
}
