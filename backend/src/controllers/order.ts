import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import validator from 'validator';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

interface OrderBody {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const createOrder = async (
  req: Request<{}, {}, OrderBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      payment,
      email,
      phone,
      address,
      total,
      items,
    } = req.body;

    // Проверяем обязательные поля
    if (
      !payment
      || !email
      || !phone
      || !address
      || total === undefined
      || !items
    ) {
      next(new BadRequestError('Не переданы обязательные поля'));
      return;
    }

    // Проверяем способ оплаты
    if (payment !== 'card' && payment !== 'online') {
      next(new BadRequestError('Некорректный способ оплаты'));
      return;
    }

    // Проверяем email
    if (!validator.isEmail(email)) {
      next(new BadRequestError('Некорректный email'));
      return;
    }

    // Проверяем массив товаров
    if (!Array.isArray(items) || items.length === 0) {
      next(new BadRequestError(
        'Массив товаров не должен быть пустым',
      ));
      return;
    }

    // Проверяем total
    if (typeof total !== 'number' || !Number.isFinite(total)) {
      next(new BadRequestError('Некорректная сумма заказа'));
      return;
    }

    // Проверяем формат каждого MongoDB ObjectId
    const hasInvalidId = items.some(
      (id) => typeof id !== 'string'
        || !mongoose.Types.ObjectId.isValid(id),
    );

    if (hasInvalidId) {
      next(new BadRequestError(
        'Передан некорректный id товара',
      ));
      return;
    }

    // Получаем уникальные id для запроса к базе
    const uniqueIds = [...new Set(items)];

    const products = await Product.find({
      _id: { $in: uniqueIds },
    });

    // Проверяем, что все товары существуют
    if (products.length !== uniqueIds.length) {
      next(new BadRequestError(
        'Один или несколько товаров не найдены',
      ));
      return;
    }

    const productsById = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ]),
    );

    // Проверяем, что у всех товаров есть цена
    const hasUnavailableProduct = items.some((id) => {
      const product = productsById.get(id);

      return product?.price === null
        || product?.price === undefined;
    });

    if (hasUnavailableProduct) {
      next(new BadRequestError(
        'В заказе есть товар, который не продаётся',
      ));
      return;
    }

    // Считаем настоящую стоимость заказа
    const calculatedTotal = items.reduce((sum, id) => {
      const product = productsById.get(id);

      return sum + (product?.price ?? 0);
    }, 0);

    // Сравниваем её с total из запроса
    if (calculatedTotal !== total) {
      next(new BadRequestError(
        'Сумма заказа не совпадает со стоимостью товаров',
      ));
      return;
    }

    // Успешный ответ
    res.status(201).send({
      id: randomUUID(),
      total: calculatedTotal,
    });
  } catch (err) {
    // Передаём непредусмотренную ошибку
    // в централизованный обработчик
    next(err);
  }
};

export default createOrder;
