import User from "../../../model/loginschema";
import connectDb from "../../../lib/mongodb";

const handler = async(req,res)=> {
    let user = await User.find()
    res.status(200).json({ user })
}

export default connectDb(handler);