const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const Pet = require('../models/Pet')
const Tag = require('../models/Tag')
const { ObjectId } = require('mongodb');
const { checkAllowedBreeds } = require('../utils')
const { catBreeds, dogBreeds, otherBreeds } = require('../constants')


// TODO
// ADD tag only ONCE to Pet


// METHODS FOR ROUTES

const getAllPets = async (req, res) => {
    // filter
    const pets = await Pet.find({}).populate('tags')
    res.status(StatusCodes.OK).json({pets})
}

const createPet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags} = req.body
    const userID = req.user.userId

   // console.log('req file', req.file)
    console.log('req files', req.files)


    //check if not empty. If return
    if (!type || !breed || !contract || !name || !description || !age ) {
        throw new CustomError.BadRequestError('Please add all information')
    }
    // check if breed is allowed
    checkAllowedBreeds({ type, breed, catBreeds, dogBreeds, otherBreeds })


    // loop for if tags && breeds exists. ??? use enum or filter in controller
    // upload main_image
    //upload multiple images 

    // Create a Pet instance 
    const pet = await Pet.create({
        type,
        breed,
        contract,
        name,
        description,
        age,
        price,
        fees,
        user: ObjectId(userID)
    })

    // Add tags to the Pet and limit max 5
    const limitedTags = tags ? tags.slice(0, 5) : null
    const petWithTags = await Pet.findByIdAndUpdate(pet._id, {
        $push: { tags: limitedTags }
    }, { new: true })

    // add Pet to Tags
    const petTags = await Tag.updateMany(
        { _id:  limitedTags   },
        { $push: { pets: petWithTags._id }}
    )


    res.status(StatusCodes.CREATED).json({ petWithTags })
}


const getSinglePet = async (req, res) => {
    const { slug } = req.params
    const pet = await Pet.findOne({ slug }).populate({
        path: 'tags',
        select: 'name slug _id'
    })

    if (!pet) {
        throw new CustomError.NotFoundError('Pet doesnt exist')
    }

    res.status(StatusCodes.OK).json({ pet })

}

const updatePet = async (req, res) => {
    const { type, breed, contract, name, description, age, price, fees, tags} = req.body
    const { slug } = req.params
    const userID = req.user.userId


    const pet = await Pet.findOne({ slug, user: userID }).populate({
        path: 'tags',
        select: 'name slug _id'
    })

    if (!pet) {
        throw new CustomError.UnauthorizedError('You have no permission')
    }


    // refactor this:
    if(breed) {
         // check if breed is allowed
        checkAllowedBreeds({type, breed, catBreeds, dogBreeds, otherBreeds})
        pet.breed = breed
    }
    if(type) {
        pet.type = type
    }
    if(contract) {
        pet.contract = contract
    }
    if(name) {
        pet.name = name 
    }
    if(description) {
        pet.description = description
    }
    if(age) {
        pet.age = age
    }
    if(price) {
        pet.price = price
    }
    if(fees) {
        pet.fees = fees
    }

    // handle tags relationship
    const oldTags = pet.tags
    const limitedTags = tags ? tags.slice(0, 5) : null
    pet.tags = limitedTags

    await pet.save()

    // remove pet from old tags
    const removePetFromOldTags = await Tag.updateMany({ pets: {
        _id: pet._id
    }}, {
        $pull: { pets: pet._id }
    })

    // add pet to new tags
    const addPetToNewTags = await Tag.updateMany({ _id: limitedTags },
        {
            $push: { pets: pet._id }
        }
    )

    res.status(StatusCodes.OK).json({ removePetFromOldTags, addPetToNewTags })

}

const deletePet = async (req, res) => {
    res.send('delete pet')
}


module.exports = {
    getAllPets,
    createPet,
    getSinglePet,
    updatePet,
    deletePet
}


    // REFACTOR UPDATE BY IF() IN COMMENTED FASHION
/* 
    const updateFunction = async (model, attributes) => {
        for (let i = 0; i < attributes.length; i++) {
            for (const [key, value] of Object.entries(attributes[i])) {
                if(key && value) {
                  model.key = value
                  return model
                }
            }
        }
    } */
  /*   const petAttributes = [{ type }, { breed }, { contract }, { name }, { description }, { age }, { price }, { fees }]
    await updateFunction(pet,  petAttributes) */