const appError = (message, statuscode) => {
    let error = new Error(message);
    error.statuscode = statuscode ? statuscode : 500;
    error.stack = error.stack;
    return error;
}

//using Class for Error handling
class AppError extends Error {
    constructor(message, statuscode) {
        super(message);
        this.statuscode = statuscode;
        this.status = 'failed';
    }
}
module.exports = { appError, AppError };