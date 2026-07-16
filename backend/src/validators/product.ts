import { celebrate, Joi, Segments } from 'celebrate';

const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),

    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),

    category: Joi.string().required(),

    description: Joi.string(),

    price: Joi.number().allow(null),
  }),
});

export default validateProductBody;
