import mongoose from 'mongoose';

interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле title должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина title - 2'],
    maxlength: [30, 'Максимальная длина title - 30'],
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле fileName должно быть заполнено'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле originalName должно быть заполнено'],
    },
  },
  category: {
    type: String,
    required: [true, 'Поле category должно быть заполнено'],
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    default: null,
  },
});

export default mongoose.model<IProduct>('product', productSchema);
