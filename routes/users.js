var User = require('../models/user');
var Task = require('../models/task');

module.exports = function (router) {
    var userRouter = router.route('/users');

    // get whole list of users 
    userRouter.get(async function (req, res) {
        try {
            const users = await User.find();
            return res.json({
                message: "here is a list of users",
                data: users
            });
        }
        catch (err) {
            return res.status(500).json(
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
            const pendingTask = req.body.pendingTasks || [];
            const dateCreated = new Date();

            // claude helped me
            // input validation 
            // https://claude.ai/share/4738a288-424f-494e-af11-41df8106462f
            if (!name) {
                return res.status(400).json(
                    {
                        message: "name is required",
                        error: "name is required"
                    }
                )
            }

            if (!email) {
                return res.status(400).json(
                    {
                        message: "name is required",
                        error: "name is required"
                    }
                )
            }

            const newUser = new User(
                {
                    name: name,
                    email: email,
                    pendingTasks: pendingTask,
                    dateCreated: dateCreated
                }
            );

            const result = await newUser.save();

            return res.status(201).json({
                message: "Successfully created user",
                data: result
            });
        }
        catch (err) {
            return res.status(500).json(
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
            const id = req.params.id;

            var querySelect = {};

            try {
                if (req.query.select) {
                    querySelect = JSON.parse(req.query.select);
                }
            }
            catch (err) {
                return res.status(400).json({
                    message: "error in select",
                    data: "error in select"
                });
            }

            const results = await User.findById(id).select(querySelect);

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

            if (err.name === 'CastError') {
                return res.status(404).json({
                    message: "cant find user",
                    data: "cant find user"
                });
            }

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

            const updateUser = await User.findByIdAndUpdate(userId, newUser, { new: true });

            // two way reference 
            // https://www.geeksforgeeks.org/mongodb/mongoose-updatemany-function/
            if (newUser.pendingTasks !== null && newUser.pendingTasks.length > 0) {
                await Task.updateMany({ _id: { $in: newUser.pendingTasks } },
                    { assignedUser: userId, assignedUserName: updateUser.name });
            }

            // claude helped me resolve this error 
            // https://claude.ai/share/4738a288-424f-494e-af11-41df8106462f
            // initially didnt add await to updateUser. 
            if (!updateUser) {
                return res.status(404).json({
                    message: "did not find user to update",
                    data: []
                });
            } else {
                return res.status(200).json({
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

            const results = await User.findByIdAndDelete(userId);

            if (!results) {
                return res.status(404).json({
                    message: "did not find user to delete",
                    data: []
                });
            } else {
                // claude helped me
                // https://claude.ai/share/4738a288-424f-494e-af11-41df8106462f
                return res.status(204).send();
            }

        } catch (err) {
            return res.status(500).json(
                {
                    message: "Failed to delete user",
                    error: "Failed to delete user"
                }
            )
        }
    })

    return router;
}