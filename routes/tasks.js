const task = require('../models/task');
var Task = require('../models/task');

module.exports = function (router) {
    var taskRouter = router.route('/tasks');

    // get all tasks
    taskRouter.get(async function (req, res) {
        try {
            const tasks = await Task.find();
            res.json({ message: "here is a list of tasks", data: tasks });
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "failed to get list of tasks",
                    error: "failed to get list of tasks"
                }
            )
        }
    });

    // create a new task
    taskRouter.post(async function (req, res) {
        try {
            const name = req.body.name;
            const description = req.body.description;
            const deadline = req.body.date;
            const completed = req.body.completed;
            const assignedUser = req.body.assignedUser || "";
            const assignedUserName = req.body.assignedUserName || "unassigned";
            const dateCreated = new Date();

            const newTask = new Task(
                {
                    name: name,
                    description: description,
                    deadline: deadline,
                    completed: completed,
                    assignedUser: assignedUser,
                    assignedUserName: assignedUserName,
                    dateCreated: dateCreated
                }
            );

            const result = await newTask.save();

            res.status(201).json({
                message: "successfully created a new task",
                data: result
            });
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "failed to create a new task",
                    error: "failed to create a new task"
                }
            )
        }
    });

    var taskIdRoute = router.route('/tasks/:id');

    // get task detail
    taskIdRoute.get(async function (req, res) {
        try {
            const id = req.param.id;

            const results = await Task.findById(id);

            if (!results) {
                res.status(404).json(
                    {
                        message: "task not found",
                        data: []
                    }
                );
            }
            else {
                res.status(200).json({
                    message: "found task",
                    data: results
                });
            }
        }
        catch (err) {
            res.status(500).json(
                {
                    message: "failed to get task",
                    error: "failed to get task"
                }
            );
        }
    });

    // replace entire task with new task
    taskIdRoute.put(async function (req, res) {
        try {
            const taskId = req.params.id;
            const newTask = req.body;

            const updateTask = Task.findByIdAndUpdate(taskId, newTask, { new: true });

            if (!updateTask) {
                res.status(404).json({
                    message: "did not find user to update",
                    data: []
                });
            }
            else {
                res.status(200).json({
                    message: "Successfully updated user",
                    data: updateUser
                });
            }

        }
        catch (err) {
            res.status(500).json(
                {
                    message: "Failed to update task",
                    error: "Failed to update task"
                }
            )
        }
    });

    // delete task 
    taskIdRoute.delete(async function (req, res) {
        try {
            const taskId = req.params.id;

            const results = Task.findByIdAndDelete(taskId);

            if (!results) {
                res.status(404).json({
                    message: "did not find task",
                    data: []
                });
            } else {
                res.status(200).json({
                    message: "successfully deleted task",
                    data: results
                });
            }

        } catch (err) {
            res.status(500).json(
                {
                    message: "Failed to delete task",
                    error: "Failed to delete task"
                }
            )
        }
    });

    return router;
}