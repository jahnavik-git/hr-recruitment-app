import { useState } from 'react';
import { CANDIDATE_TAGS, TAG_COLORS, TAG_BG_COLORS } from '../constants/tags';
import { addCandidateTag, removeCandidateTag } from '../services/candidateService';

const TagSelector = ({ candidateId, tags = [], onTagsChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTag = async (tag) => {
    if (tags.includes(tag)) {
      return;
    }

    setLoading(true);
    try {
      const response = await addCandidateTag(candidateId, tag);
      if (response.data.success) {
        onTagsChange([...tags, tag]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tag) => {
    setLoading(true);
    try {
      const response = await removeCandidateTag(candidateId, tag);
      if (response.data.success) {
        onTagsChange(tags.filter((t) => t !== tag));
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableTags = CANDIDATE_TAGS.filter((tag) => !tags.includes(tag));

  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Candidate Tags</h5>
      </div>
      <div className="card-body">
        {tags.length > 0 ? (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="badge d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: TAG_COLORS[tag] || '#757575',
                    color: '#000',
                    fontSize: '0.9rem',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    className="btn btn-sm p-0"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#000',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      lineHeight: '1',
                    }}
                    title={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-muted mb-3">No tags assigned</div>
        )}

        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-primary"
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading || availableTags.length === 0}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Tag
          </button>

          {showDropdown && availableTags.length > 0 && (
            <div className="dropdown-menu show" style={{ position: 'absolute', display: 'block', marginTop: '0.5rem' }}>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className="dropdown-item"
                  onClick={() => handleAddTag(tag)}
                  style={{
                    backgroundColor: TAG_BG_COLORS[tag] || '#F5F5F5',
                    borderLeft: `4px solid ${TAG_COLORS[tag] || '#757575'}`,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {availableTags.length === 0 && tags.length > 0 && (
            <div className="text-muted small mt-2">All tags assigned</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
