module.exports = {
    makeBatchRequest: function (web3, calls) {
        let batch = new web3.BatchRequest();

        let promises = calls.map(call => {
            return new Promise((res, rej) => {
                let req = call.request(params, (err, data) => {
                    if (err) rej(err);
                    else res(data)
                });
                batch.add(req)
            })
        })

        batch.execute()

        //allow rejections so long as everything settles
        return Promise.allSettled(promises)
    }
}