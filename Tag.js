const mongoose = require('mongoose');
const validator = require('validator');
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const { Schema } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    maxLength: 50,
    minLength: 2,
    trim: true,
    lowercase: true,
    unique: true,
  },
  slug: {
    type: String,
    slug: ['name'],
    unique: true,
    index: true,
    slug_padding_size: 2,
  },
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
  ],
});

module.exports = mongoose.model('Tag', tagSchema);
