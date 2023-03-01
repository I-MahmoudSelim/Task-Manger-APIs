module.exports = function (fn) {
    return async function (req, res, next) {
        try {
            await fn(req, res, next)
        } catch (err) {
            if (err.status) {
                res.status(err.status).send({ error: err.message })
            } else {
                res.status(400).send({ error: err })
            }
        }
    }
}