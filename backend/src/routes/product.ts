import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/product';
import validateProductBody from '../validators/product';

const router = Router();

router.get('/product', getProducts);
router.post(
  '/product',
  validateProductBody,
  createProduct,
);

export default router;
