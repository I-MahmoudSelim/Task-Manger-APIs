class myError extends Error {
    constructor(status = 500, message = "There is something wrong!") {
        super()
        this.message = message;
        this.status = status;
    }
}

module.exports = myError;