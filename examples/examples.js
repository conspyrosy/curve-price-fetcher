require('dotenv').config()

const poolAddresses = require('../constants/poolAddresses.json');
const customPoolMetaData = require('../examples/customPoolSet.json');
const CurvePriceFetcher = require("../main/fetcher");

const Web3 = require("web3");

let web3 = new Web3(
    new Web3.providers.HttpProvider(`https://${process.env.NETWORK}.infura.io/v3/${process.env.PROJECT_ID}`)
);

const swapFrom = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const swapTo = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function exampleWithDefaultPools() {
    const curvePriceFetcher = new CurvePriceFetcher({
        web3
    });

    let prices = await curvePriceFetcher.getPoolPrices(swapFrom, swapTo, '1000000000000000000000');

    console.log("exampleWithDefaultPools");

    prices.forEach(
        pool => console.log(`Pool ${pool.poolAddress}: ${pool.price.toNumber()}`)
    )

    console.log('');
}

async function exampleWithCustomPools() {
    const curvePriceFetcher = new CurvePriceFetcher({
        web3,
        customPoolData: customPoolMetaData //use a custom set of pools
    });

    let prices = await curvePriceFetcher.getPoolPrices(swapFrom, swapTo, '1000000000000000000000');

    console.log("exampleWithCustomPools");

    prices.forEach(
        pool => console.log(`Pool ${pool.poolAddress}: ${pool.price.toNumber()}`)
    )

    console.log('');
}

async function exampleWithPoolAddresses() {
    const curvePriceFetcher = new CurvePriceFetcher({
        web3,
        customPoolData: poolAddresses
    });

    //fetch the pool data which will be stored in the instance. we need to do this because we only supplied addresses
    await curvePriceFetcher.getAllPoolMetaData();

    let prices = await curvePriceFetcher.getPoolPrices(swapFrom, swapTo, '1000000000000000000000');

    console.log("exampleWithPoolAddresses");

    prices.forEach(
        pool => console.log(`Pool ${pool.poolAddress}: ${pool.price.toNumber()}`)
    )

    console.log('');
}

exampleWithDefaultPools();

exampleWithCustomPools();

exampleWithPoolAddresses();