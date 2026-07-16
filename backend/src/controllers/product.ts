import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  Product.find({})
    .then((products) => {
      res.send({
        items: products,
        total: products.length,
      });
    })
    .catch(next);
};

export const createProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    title,
    image,
    category,
    description,
    price,
  } = req.body;

  Product.create({
    title,
    image,
    category,
    description,
    price,
  })
    .then((product) => {
      res.status(201).send(product);
    })
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        next(new BadRequestError(
          'Переданы некорректные данные товара',
        ));
        return;
      }

      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError(
          'Товар с таким названием уже существует',
        ));
        return;
      }

      next(err);
    });
};
