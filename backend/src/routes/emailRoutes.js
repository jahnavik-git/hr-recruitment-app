import { Router } from 'express';
import { createCandidateEmailRecord, getCandidateEmailHistory } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.post('/draft', createCandidateEmailRecord);
router.get('/candidate/:candidateId', getCandidateEmailHistory);

export default router;
