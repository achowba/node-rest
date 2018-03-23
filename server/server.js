const express = require('express');
const bodyParser =require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose-config');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const port = process.env.PORT || 2019;

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
        return res.status(404).send();
    }

    Todo.findById(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(404).send(e);
    });
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
});

module.exports = {
    app
};