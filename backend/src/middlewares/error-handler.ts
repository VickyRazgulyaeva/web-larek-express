import {
  Request,
  Response,
  NextFunction,
} from 'express';

interface HttpError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
};

export default errorHandler;
