const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')


// TODO
// ADD PET only ONCE to Tag

const getAllTags = async (req, res) => {
    const tags = await Tag.find({}).populate('pets')
    res.status(StatusCodes.OK).json({ tags })
}

const createTag = async (req, res) => {
    const { name } = req.body
    if(!name) {
        throw new CustomError.BadRequestError('Name cant be empty')
    }

    const tag = await Tag.create({ name })

    if (!tag) {
        throw new CustomError.BadRequestError('Tag wasnt created')
    }

    res.status(StatusCodes.OK).json({tag})
}

const getSingleTag = async (req, res) => {
    const { slug } = req.params

    const tag = await Tag.findOne({ slug }).populate('pets')

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const updateTag = async (req, res) => {
    const { slug } = req.params
 
    const tag = await Tag.findOne({ slug })

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    res.status(StatusCodes.OK).json({tag})
}

const deleteTag = async (req, res) => {

    const { slug } = req.params

    const tag = await Tag.findOne({ slug })

    if (!tag) {
        throw new CustomError.NotFoundError('Tag was not found')
    }

    // delete tag from pet
    const deleteTagFromPet = await Pet.updateMany({ tags: tag._id }, {
        $pull: { 
            tags: tag._id
        }
    })

    await tag.deleteOne()

    res.status(StatusCodes.OK).json({tag, deleteTagFromPet})
}




module.exports = {
    getAllTags,
    createTag,
    getSingleTag,
    updateTag,
    deleteTag
}