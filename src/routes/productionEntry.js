import { Router } from 'express';
import { createProductionEntry, get, imgFileName } from '../services/productionEntry.service.js';
import multer from 'multer';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}`)
    }
})

const multerUpload = multer({ storage })

const router = Router();

router.get('/', get);

router.post('/createProData', createProductionEntry)

router.patch('/imgFileName', multerUpload.single('image'), imgFileName);


export default router; 