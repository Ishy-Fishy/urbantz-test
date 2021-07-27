const shortid = require('shortid')
var express = require('express');
var app = express();
const bodyParser = require('body-parser')
const Utils = require('./utils');
const {StatusEnum} = require('./enums')
app.use(bodyParser.json())

function serve() {
    app.get('/ohms/:id', async (req, res) => {
        const ohm = await Utils.getOhmById(req.params.id);
        res.send(ohm);
    })

    app.post('/ohms/:id/status', async (req, res) => {
        const ohm = await Utils.getOhmById(req.params.id)
        const status = req.body.status;
        if (Utils.validateNextStatus(ohm, status)) {
            const updatePayload = {status};
            if (status === StatusEnum.REFUSED) {
                // didn't really know where to put refusal reason, so it became a comment
                updatePayload.comment = req.body.reason;
            }
            const updatedOhm = await Utils.updateById(ohm.id, updatePayload)
            res.send(updatedOhm)
        } else {
            res.status(400).send({error: 'Invalid next status'})
        }
    })

    app.listen(3000, () => console.log('listening on port 3000'));
}

serve();