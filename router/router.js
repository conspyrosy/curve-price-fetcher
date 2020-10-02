require('dotenv').config()

const Web3 = require("web3");

let web3 = new Web3(
    new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.PROJECT_ID}`)
);

const POOL_ABI = require('./../abi/pool.json');
const pools = require('./../constants/pools.json');

const getContract = (address) => new web3.eth.Contract(POOL_ABI, address);

const getCallback = (address) => {
    return (err, res) => {
        if(!err) {
            console.log(address + " " + JSON.stringify(res));
        } else {
            console.error("Error: " + JSON.stringify(err));
        }
    }
}

const getPoolMetaData = (maxAssetsPerPool = 10) => {

    let promises = [];

    const metaDataCallback = (id, array) => {
        return (err, res) => {
            if(!err) {
                array[id] = res;
                console.log(array);
                console.log(id + " " + JSON.stringify(res));
            } else {
                console.error("Error: " + JSON.stringify(err));
            }
        }
    }

    const batch = new web3.BatchRequest();

    pools.forEach(
        pool => {
            let coins = [];
            let underlying = [];
            for(let i = 0; i < maxAssetsPerPool; i++) {
                batch.add(getContract(pool.poolAddress).methods.coins(i).call.request(metaDataCallback(i, coins)));
                batch.add(getContract(pool.poolAddress).methods.underlying_coins(i).call.request(metaDataCallback(i, underlying)));
            }
        }
    )

    batch.execute();
}

getPoolMetaData();

/*
const getPoolPrices = () => {
    const batch = new web3.BatchRequest();

    pools.forEach(
        pool => {
            batch.add(getContract(pool.poolAddress).methods.get_dy_underlying(0, 1, '1000000000000000000').call.request(getCallback(pool.poolAddress)));
        }
    )

    batch.execute();
}

getPoolPrices();
 */