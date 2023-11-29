
// Create a new user
const User = require('../models/userModels');
const fs = require('fs');
//  Create User
exports.createUser = async (req, res) => {
    try {
        const { fname, lname, email } = req.body;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const image = req.files.image;
        const imageName = `${Date.now()}_${image.name}`;

        image.mv(`uploads/${imageName}`, (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const newUser = new User({ fname, lname, email, image: imageName });
            newUser.save();

            // Construct the response object with user information and file details
            const responseData = {
                _id: newUser._id,
                fname: newUser.fname,
                lname: newUser.lname,
                email: newUser.email,
                image: {
                    filename: imageName,
                    // You may include other file details as needed
                },
            };

            res.json(responseData);
        });
    } catch (error) {
        console.log(error.message, "message")
        res.status(500).json({ error: error.message });
    }
};
//  Get  User
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//  get user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//  Update User
exports.updateUserById = async (req, res) => {
    try {
        const { fname, lname, email } = req.body;

        if (req.files && Object.keys(req.files).length > 0) {
            const image = req.files.image;
            const imageName = `${Date.now()}_${image.name}`;

            await image.mv(`uploads/${imageName}`);

            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { fname, lname, email, image: imageName },
                { new: true }
            ).exec();

            res.json(updatedUser);
        } else {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { fname, lname, email },
                { new: true }
            ).exec();

            res.json(updatedUser);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//  Delete User

exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.image) {
            const imagePath = `uploads/${user.image}`;

            // Check if the file exists before trying to delete it
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            } else {
                console.log(`File not found: ${imagePath}`);
            }
        }

        await User.findOneAndDelete({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};