import connectDb from "../../../lib/mongodb";
import User from '../../../model/loginschema';
import jwt from 'jsonwebtoken';

const handler = async (req, res) => {
    if (req.method === 'POST') {
        console.log(req.body);
        try {
            const { userid, password } = req.body;
            const user = await User.findOne({ userid });

            if (user && user.password === password) {
                // Generate a JWT token with the user's role
                const token = jwt.sign({ userid, role: user.role }, 'secret123', { expiresIn: '1h' }); 

                // Send the token as JSON response
                res.status(200).json({ token });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
                return; // Exit the handler if credentials are invalid
            }
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
            return; // Exit the handler on internal server error
        }

        // No need to redirect here
    } else {
        res.status(400).json({ error: "This method is not allowed" });
    }
}

export default connectDb(handler);
