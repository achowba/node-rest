let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 2019;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoIt';
} else if (env === 'test') {
    process.env.PORT = 2000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoItTest';
}
