require('./config/config');
let env = process.env.NODE_ENV || 'development';

const _ = require('lodash');
const express = require('express');
const bodyParser =require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose-config');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/auth');

const port = process.env.PORT;

let app = express();

app.use(bodyParser.json());

// create route for posting data to the api
app.post('/todos', authenticate, (req, res) => {
    // console.log(req.body);

    // create a todo from the data that comes from the post request
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// get all todos
app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos})
    }, (e) => {
        res.status(400).send(e);
    });
});

// get a single tod0 item
app.get('/todos/:id', authenticate, (req, res) => {
    let todoId = req.params.id;

    if (!ObjectID.isValid(todoId)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: todoId,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// delete a todo by id
app.delete('/todos/:id', authenticate, (req, res) => {
    let todoId = req.params.id;

    if (ObjectID.isValid(todoId) === false) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: todoId,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
    let todoId = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (ObjectID.isValid(todoId) === false) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: todoId,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});


// post a user
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    // create a user from the data that comes from the post request
    let user = new User (body);

    user.save().then(() => {
        return user.generateAuthToken();
        // res.send(user);
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        // console.log(e);
        res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    let date = new Date();
    console.log(`\nThis app is running on ${env} mode\n`);
    console.log(`Server started on port ${port} at ${date.toLocaleTimeString()}\n`);
});

module.exports = {
    app
};