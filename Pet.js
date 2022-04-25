const mongoose = require('mongoose');
const validator = require('validator');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const { Schema } = mongoose;

const petSchema = new Schema(
  {
    slug: {
      type: String,
      slug: ['name'],
      unique: true,
      slug_padding_size: 3,
    },
    type: {
      type: String,
      required: [true, 'Type must be provided'],
      enum: ['kočka', 'pes', 'ostatní'],
    },
    breed: {
      type: String,
      required: [false, 'breed must be provided'],
      maxLength: 30,
    },
    contract: {
      type: String,
      required: [true, 'contract must be provided'],
      enum: ['koupě', 'adopce', 'darování'],
      default: 'koupě',
    },
    name: {
      type: String,
      required: [true, 'name must be provided'],
      minlength: 3,
      maxLength: 30,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'text must be provided'],
      minlength: 3,
      maxLength: 500,
      trim: true,
    },
    age: {
      type: String,
      required: [true, 'age must be provided'],
      enum: ['mládě', 'dospělý', 'senior'],
    },
    main_image: {
      type: String,
      required: [false, 'image must be provided'],
    },
    images: [String],
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
    fees: {
      type: Number,
      required: [false, 'Please provide fees'],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
