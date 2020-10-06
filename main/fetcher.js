const BigNumber = require('bignumber.js');

const POOL_ABI = require('./../abi/pool.json');
const pools = require('../constants/poolMetaData.json');
const batchRequest = require('./../utils/batchRequest');

/**
 * Class that holds pool meta data once created (or fetched) and has methods to fetch prices
 */
class CurvePriceFetcher {
    constructor({
        web3,
        customPoolData
    }) {
        if(!web3) {
            throw new Error("You must pass in a web3 instance");
        }
        
        this.web3 = web3;
        
        if(customPoolData) {
            this.poolMetaData = customPoolData
        } else {
            this.poolMetaData = pools;
        }
    }

    getPoolContract(address) {
        return new this.web3.eth.Contract(POOL_ABI, address);
    }

    getPoolMetaData(pool, maxAssetsPerPool = 10) {
        let calls = [];

        let coins = [];
        let underlying = [];

        //since curve doesnt tell us the number of pool assets, iterate until the max to look for
        for (let i = 0; i < maxAssetsPerPool; i++) {
            calls.push({
                ethCall: this.getPoolContract(pool.poolAddress).methods.coins(i).call,
                onSuccess: res => coins.push(res),
                onError: () => {}
            });

            calls.push({
                ethCall: this.getPoolContract(pool.poolAddress).methods.underlying_coins(i).call,
                onSuccess: res => underlying.push(res),
                onError: () => {}
            });
        }

        //this will always succeed regardless of failures...
        return new Promise((resolve, reject) => {
            batchRequest.makeBatchRequest(this.web3, calls, { allowFailures: true }).then(result =>
                resolve({
                    ...pool,
                    poolAddress: pool.poolAddress.toLowerCase(),
                    coins,
                    underlying: underlying.length > 0 ? underlying : coins //for btc pools, no underlying. so use coins as underlying
                })
            )
        });
    }

    /**
     * Get a list of pools with both assets, and the price for the swap in those pools. Pools are ordered in descending
     * value of price (best price first).
     *
     * Note: this doesnt take into account gas fees.
     * @param swapFrom asset address to swap from
     * @param swapTo asset address to swap to
     * @param amount amount to swap - passed as a string to decimal places of asset e.g. '10000000000000'
     *
     * @returns promise resolving with array of pool prices descending.
     */
    getPoolPrices(swapFrom, swapTo, amount) {
        let calls = [];
        let prices = [];

        this.getPoolsWithAssets([swapFrom, swapTo]).forEach(pool => {
            const fromIndex = pool.underlying.indexOf(swapFrom.toLowerCase());
            const toIndex = pool.underlying.indexOf(swapTo.toLowerCase());

            calls.push({
                    ethCall: this.getPoolContract(pool.poolAddress).methods.get_dy_underlying(fromIndex, toIndex, amount).call,
                    onSuccess: result => prices.push({
                        poolAddress: pool.poolAddress,
                        price: new BigNumber(result)
                    }),
                    onError: () => {}
            });
        });

        return new Promise((resolve, reject) => {
            batchRequest.makeBatchRequest(this.web3, calls).then(result => {
                    prices.sort((a, b) => {
                        if(a.price.isGreaterThan(b.price)) {
                            return 1;
                        }

                        if(a.price.isEqualTo(b.price)) {
                            return 0;
                        }

                        return -1;
                    });

                    resolve(prices);
                }
            )
        });
    }

    /**
     * Initialisation method to be used if only pool addresses are passed. It will fetch pool meta data (coins in pool)
     * from contract.
     *
     * @param maxAssetsPerPool since curve contracts dont specify number of assets in pool, it will iterate through this
     * many values in the array to fetch assets. better to set high.
     *
     * @returns pool meta data and also mutates this.poolMetaData with the result
     */
    async getAllPoolMetaData(maxAssetsPerPool = 10) {
        return new Promise((resolve, reject) => {
            Promise.all(this.poolMetaData.map(pool => this.getPoolMetaData(pool, maxAssetsPerPool))).then(result => {
                this.poolMetaData = this.convertAddressesToLowerCase(result);
                resolve(this.poolMetaData);
            });
        });
    }

    getPoolsWithAssets(containedAssets) {
        let lowerCasedContainedAssets = containedAssets.map(address => address.toLowerCase());
        return this.poolMetaData.filter(pool => lowerCasedContainedAssets.every(containedAsset => pool.underlying.includes(containedAsset)));
    }

    convertAddressesToLowerCase(pools) {
        let newPools = pools;

        newPools.forEach(
            pool => {
                pool.coins = pool.coins.map(address => address.toLowerCase());
                pool.underlying = pool.underlying.map(address => address.toLowerCase());
            }
        )

        return newPools;
    }
}

module.exports = CurvePriceFetcher;