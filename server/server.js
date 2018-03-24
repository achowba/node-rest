require('./config/config');
let env = process.env.NODE_ENV || 'development';

const _ = require('lodash');
const express = require('express');
const bodyParser =require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose-config');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const port = process.env.PORT;

let app = express();

app.use(bodyParser.json());

// create route for posting data to the api
app.post('/todos', (req, res) => {
    console.log(req.body);

    // create a todo from the data that comes from the post request
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// get all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos})
    }, (e) => {
        res.status(400).send(e);
    });
});

// get a single tod0 item
app.get('/todos/:id', (req, res) => {
    let todoId = req.params.id;
    if (ObjectID.isValid(todoId) === false) {
        return res.status(400).send();
    }

    Todo.findById(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// delete a todo by id
app.delete('/todos/:id', (req, res) => {
    let todoId = req.params.id;
    if (ObjectID.isValid(todoId) === false) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(todoId, {
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

app.listen(port, () => {
    console.log(`\nServer started on port: ${port}\n`);
    console.log(`This app is running on ${env} mode\n\n\n`);
});

module.exports = {
    app
};