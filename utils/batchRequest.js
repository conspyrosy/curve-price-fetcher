module.exports = {
    /**
     * @param web3 web3 instance
     * @param calls array of web3 calls to make
     * @param allowFailures set to true to allow partial or complete failures. set to false if everything must succeed
     * @param verbose set to true for logging of responses/errors
     *
     * @returns promise that will resolve on completion (or failure if allowed) of all requests or will reject on failure.
     */
    makeBatchRequest: function (web3, calls, { allowFailures, verbose } = { allowFailures: false, verbose: false }) {
        let batch = new web3.BatchRequest();

        let promises = calls.map(call => {
            return new Promise((resolve, reject) => {
                let req = call.ethCall.request((err, data) => {
                    if (err) {
                        if(verbose) {
                            console.error("Error: " + JSON.stringify(err));
                        }
                        call.onError(err);
                        reject(err);
                    }
                    else {
                        if(verbose) {
                            console.log("Success: " + JSON.stringify(data));
                        }
                        call.onSuccess(data);
                        resolve(data)
                    }
                });
                batch.add(req)
            })
        })

        batch.execute()

        if(allowFailures) {
            return Promise.allSettled(promises)
        } else {
            return Promise.all(promises)
        }
    }
}