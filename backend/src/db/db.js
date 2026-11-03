import Mongoose from'mongoose';

async function connectDB(){

    try{
        await Mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
        console.log('MongoDB connected')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

export {connectDB}
