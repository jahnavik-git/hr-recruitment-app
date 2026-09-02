import { useEffect, useState } from 'react';

const FILE_ICONS = {
  pdf: { icon: 'bi-filetype-pdf', color: '#dc3545' },
  doc: { icon: 'bi-filetype-doc', color: '#2b579a' },
  docx: { icon: 'bi-filetype-docx', color: '#2b579a' },
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const getExtension = (filename = '') => filename.split('.').pop()?.toLowerCase() || '';

const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Shows a small preview card (or circular avatar) for an uploaded document/image.
 * Prefers an instant local preview from `file` (via URL.createObjectURL) and
 * falls back to `url` (the server-hosted file) when no local File is available,
 * e.g. when editing an existing candidate.
 */
const DocumentPreview = ({ file, url, filename, shape = 'card', uploading, onRemove }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return undefined;
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const name = filename || file?.name || '';
  const ext = getExtension(name);
  const previewSrc = objectUrl || url || null;
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const sizeLabel = file ? formatFileSize(file.size) : '';

  if (!name && !uploading) return null;

  const handleOpen = () => {
    if (previewSrc) window.open(previewSrc, '_blank', 'noopener');
  };

  if (shape === 'circle') {
    return (
      <div className="d-flex flex-column align-items-center flex-shrink-0" style={{ width: 96 }}>
        <div className="position-relative">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={name || 'Candidate photo'}
              className="rounded-circle border"
              style={{ width: 72, height: 72, objectFit: 'cover', cursor: 'pointer' }}
              onClick={handleOpen}
            />
          ) : (
            <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: 72, height: 72 }}>
              <i className="bi bi-person fs-3 text-muted"></i>
            </div>
          )}
          {onRemove && name && (
            <button
              type="button"
              className="btn btn-sm btn-danger rounded-circle p-0 position-absolute top-0 end-0 d-flex align-items-center justify-content-center"
              style={{ width: 22, height: 22 }}
              onClick={onRemove}
              aria-label="Remove photo"
              title="Remove"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
        <div className="small text-truncate mt-1 text-center" style={{ maxWidth: 96 }} title={name}>
          {uploading ? 'Uploading…' : name || 'Photo'}
        </div>
      </div>
    );
  }

  const iconMeta = FILE_ICONS[ext];

  return (
    <div className="position-relative flex-shrink-0" style={{ width: 120 }}>
      {onRemove && name && (
        <button
          type="button"
          className="btn btn-sm btn-danger rounded-circle p-0 position-absolute d-flex align-items-center justify-content-center"
          style={{ width: 20, height: 20, top: -6, right: -6, zIndex: 2 }}
          onClick={onRemove}
          aria-label="Remove document"
          title="Remove"
        >
          <i className="bi bi-x small"></i>
        </button>
      )}
      <div
        className="border rounded d-flex align-items-center justify-content-center bg-light overflow-hidden"
        style={{ width: 120, height: 90, cursor: previewSrc ? 'pointer' : 'default' }}
        onClick={handleOpen}
      >
        {isImage && previewSrc ? (
          <img src={previewSrc} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : ext === 'pdf' && previewSrc ? (
          <embed src={previewSrc} type="application/pdf" style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
        ) : (
          <i className={`bi ${iconMeta?.icon || 'bi-file-earmark'} fs-1`} style={{ color: iconMeta?.color || '#6c757d' }}></i>
        )}
      </div>
      <div className="small text-truncate mt-1" title={name}>
        {uploading ? 'Uploading…' : name || 'Document'}
      </div>
      {sizeLabel && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{sizeLabel}</div>}
    </div>
  );
};

export default DocumentPreview;
