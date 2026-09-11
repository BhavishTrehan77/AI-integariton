import mongoose from 'mongoose'

const embeddingSchema=new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    embedding:{
        type:[Number],
        required:true
    }
})


const Embedding=mongoose.model('Embedding',embeddingSchema)


export default Embedding