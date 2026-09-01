import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadResume,
  uploadCandidateImage,
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  matchCandidate,
  getPipelineStatuses,
  updateCandidateStatus,
  deleteCandidate,
  addTag,
  removeTag,
  getTagAnalytics,
} from '../controllers/candidateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    // Preserve original filename - sanitize it to remove spaces and special chars
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, sanitized);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
// Candidate images are uploaded to Cloudinary, so they're kept in memory rather than
// written to the (ephemeral, on Render) local disk. See uploadCandidateImage.
const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/upload-image', uploadImage.single('image'), uploadCandidateImage);
router.get('/statuses', getPipelineStatuses);
router.get('/analytics/tags', getTagAnalytics);
router.route('/').get(getCandidates).post(authorize('Admin', 'HR', 'Recruiter'), createCandidate);
router
  .route('/:id')
  .get(getCandidateById)
  .put(authorize('Admin', 'HR', 'Recruiter'), updateCandidate)
  .delete(authorize('Admin', 'HR', 'Recruiter'), deleteCandidate);
router.post('/:id/match', authorize('Admin', 'HR', 'Recruiter'), matchCandidate);
router.patch('/:id/status', authorize('Admin', 'HR', 'Recruiter'), updateCandidateStatus);
router.post('/:id/tags', authorize('Admin', 'HR', 'Recruiter'), addTag);
router.delete('/:id/tags/:tag', authorize('Admin', 'HR', 'Recruiter'), removeTag);

export default router;
