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
    taskRouter.get(async function (req, res) {
        try {
            const name = req.body.name;
            const description = req.body.description;
            const deadline = req.body.date;
            const completed = req.body.completed;
            const assignedUser = req.body.assignedUser || "";
            const assignedUserName = req.body.assignedUserName || "unassigned";
            const dateCreated = new Date();

            const newTask = Task(
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

    return router;
}