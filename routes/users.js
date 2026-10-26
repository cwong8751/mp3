var User = require('../models/user');

module.exports = function (router) {
    var userRouter = router.route('/users');

    // get whole list of users 
    userRouter.get(async function (req, res) {
        try {
            const users = await User.find();
            res.json({
                message: "here is a list of users",
                data: users
            });
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "Failure to find users",
                    error: "Failure to find users"
                }
            )
        }
    });

    // create a new user 
    userRouter.post(async function (req, res) {
        try {
            const name = req.body.name;
            const email = req.body.email;
            const pendingTask = req.body.pendingTask || [];
            const dateCreated = new Date();

            const newUser = User(
                {
                    name: name,
                    email: email,
                    pendingTask: pendingTask,
                    dateCreated: dateCreated
                }
            );

            const result = await newUser.save();

            res.status(201).json({
                message: "Successfully created user",
                data: result
            });
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "Failed to create user",
                    error: "Failed to create user"
                }
            )
        }
    });

    // get user id 
    var idRoutes = router.route('/users/:id');

    // get a specific user according to id 
    idRoutes.get(async function (req, res) {
        try {
            const id = req.param.id;

            const results = await User.findById(id);

            if (!results) {
                res.status(404).json({
                    message: "user not found",
                    data: []
                });
            } else {
                res.status(200).json({
                    message: "Successfully found user",
                    data: results
                });
            }
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "Failed to get user information",
                    error: "Failed to get user information"
                }
            )
        }
    });

    // replace entire user with supplied user 
    idRoutes.put(async function (req, res) {
        try {
            const userId = req.params.id;
            const newUser = req.body;

            const updateUser = User.findByIdAndUpdate(userId, newUser, { new: true });

            if (!results) {
                res.status(404).json({
                    message: "did not find user to update",
                    data: []
                });
            } else {
                res.status(200).json({
                    message: "Successfully updated user",
                    data: updateUser
                });
            }
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "Failed to update user",
                    error: "Failed to update user"
                }
            )
        }
    });

    // delete user with specified user 
    idRoutes.delete(async function (req, res) {
        try {
            const userId = req.params.id;

            const results = User.findByIdAndDelete(userId);

            if (!results) {
                res.status(404).json({
                    message: "did not find user to delete",
                    data: []
                });
            } else {
                res.status(200).json({
                    message: "Successfully deleted user",
                    data: results
                });
            }

        } catch (err) {
            res.status(500).json(
                {
                    message: "Failed to delete user",
                    error: "Failed to delete user"
                }
            )
        }
    })

    return router;
}