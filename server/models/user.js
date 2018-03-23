let mongoose = require('mongoose');

// setup user model
let User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minLength: 5,
        trim: true
    }
});

module.exports = {
    User,
};