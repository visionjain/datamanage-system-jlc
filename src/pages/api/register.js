// pages/api/register.js

import connectDb from "../../../lib/mongodb";
import User from "../../../model/loginschema";
import { useRouter } from 'next/router';

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { userid, password } = req.body;

      // Check if the referral code is valid
      const user = new User({
        userid,
        password,
      });

      await user.save();
      res.status(201).json({ success: "Registration successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "This method is not allowed" });
  }
};

export default connectDb(handler);
