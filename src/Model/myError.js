class myError extends Error {
    constructor(status = 400, message = "Bad request") {
        super()
        this.message = message;
        this.status = status;
    }
}

module.exports = myError;