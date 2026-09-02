import { useState } from 'react';
import { getResumeUrl } from '../utils/urlHelper';

const getInitials = (firstName, lastName) =>
  ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'C';

/**
 * Circular candidate avatar: shows the uploaded photo (candidate.imageUrl) when
 * available, otherwise falls back to a two-letter initials circle. Also falls
 * back to initials if the image URL fails to load.
 */
const CandidateAvatar = ({ candidate, size = 32, fontSize, fontWeight = 600 }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = candidate?.imageUrl;
  const hasImage = Boolean(imageUrl) && !imgFailed;

  if (hasImage) {
    return (
      <img
        src={getResumeUrl(imageUrl)}
        alt={`${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate'}
        className="rounded-circle border flex-shrink-0"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: size, height: size, fontSize: fontSize || size * 0.38, fontWeight }}
    >
      {getInitials(candidate?.firstName, candidate?.lastName)}
    </div>
  );
};

export default CandidateAvatar;
