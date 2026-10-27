var User = require('../models/user');
var Task = require('../models/task');

module.exports = function (router) {
    var taskRouter = router.route('/tasks');

    // get all tasks
    taskRouter.get(async function (req, res) {
        try {
            const tasks = await Task.find();
            return res.json({ message: "here is a list of tasks", data: tasks });
        }
        catch (err) {
            return res.status(500).json(
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
            const deadline = req.body.deadline;
            const completed = req.body.completed;
            const assignedUser = req.body.assignedUser || "";
            const assignedUserName = req.body.assignedUserName || "unassigned";
            const dateCreated = new Date();

            if (!name || !description || !deadline) {
                return res.status(400).json({
                    message: "missing fields for new task",
                    error: "missing fields for new task"
                });
            }

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

            return res.status(201).json({
                message: "successfully created a new task",
                data: result
            });
        }
        catch (err) {
            return res.status(500).json(
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


            // chain queries
            // https://mongoosejs.com/docs/api/query.html
            // var queryWhere = req.query.where;
            // var querySort = req.query.sort;
            // var querySelect = req.query.select;
            // var querySkip = req.query.skip;
            // var queryLimit = req.query.limit;
            // var queryCount = req.query.count;

            // if (queryWhere) { queryWhere = JSON.parse(req.query.where); } else { queryWhere = {}; }
            // if (querySort) { querySort = JSON.parse(req.query.sort); } else { querySort = {}; }
            // if (querySelect) { querySelect = JSON.parse(req.query.select); } else { querySelect = {}; }
            // if (querySkip) { querySkip = parseInt(req.query.skip); } else { querySkip = 0; }
            // if (queryLimit) { queryLimit = parseInt(req.query.limit); } else { queryLimit = 0; }

            // if (queryCount) {
            //     const countNum = await Task.countDocuments(queryWhere);
            //     return res.json({
            //         message: "counted task documents according to where",
            //         data: countNum
            //     });
            // }

            const results = await Task.findById(id).select(querySelect);

            if (!results) {
                return res.status(404).json(
                    {
                        message: "task not found",
                        data: []
                    }
                );
            }
            else {
                return res.status(200).json({
                    message: "found task",
                    data: results
                });
            }
        }
        catch (err) {

            if (err.name === 'CastError') {
                return res.status(404).json({
                    message: "cant find user for task to get",
                    data: "cant find user for task to get"
                });
            }

            return res.status(500).json(
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

            const updateTask = await Task.findByIdAndUpdate(taskId, newTask, { new: true });

            if (!updateTask) {
                return res.status(404).json({
                    message: "did not find task to update",
                    data: []
                });
            }

            // remove task from pending task list 
            if (updateTask.completed) {
                await User.findByIdAndUpdate(updateTask.assignedUser, { $pull: { pendingTasks: taskId } });
            }

            // two way reference 
            // https://www.mongodb.com/docs/manual/reference/operator/update/addtoset/
            if (updateTask.assignedUser !== null) {
                await User.findByIdAndUpdate(updateTask.assignedUser, { $addToSet: { pendingTasks: taskId } });
            }

            return res.status(200).json({
                message: "Successfully updated task",
                data: updateTask
            });

        }
        catch (err) {
            // error for update non existent task id 
            if (err.name === 'CastError'
            ) {
                return res.status(404).json({
                    message: "did not find task to update",
                    data: "did not find task to update"
                });
            }
            return res.status(500).json(
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

            const results = await Task.findByIdAndDelete(taskId);

            if (!results) {
                return res.status(404).json({
                    message: "did not find task",
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
                    message: "Failed to delete task",
                    error: "Failed to delete task"
                }
            )
        }
    });

    return router;
}