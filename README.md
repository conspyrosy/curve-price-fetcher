# curve-price-fetcher

curve-price-fetcher is a node package for interacting with curve smart contracts and finding the best price for swaps (not taking into account fees). you will need to provide a web3 instance for it to work.


### Usage:

Firstly install the dependency to your project

```
npm i curve-price-fetcher --save
```

Import the dependency where you need it:

```
const CurvePriceFetcher = require('curve-price-fetcher');
```

Instantiate the fetcher and pass in a web3 instance:

```
const web3 = new Web3(new Web3.providers.HttpProvider(`https://localhost:8545`));

const fetcher = new CurvePriceFetcher();
```

above we are using the hardcoded set of pools and meta data.

alternatively, you can pass in a custom list of pool meta data.

```
const web3 = new Web3(new Web3.providers.HttpProvider(`https://localhost:8545`));

const customPoolData = [
    {
        "poolAddress": "0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56",
        "coins": [
            "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
            "0x39aa39c021dfbae8fac545936693ac917d5e7563"
        ],
        "underlying": [
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
        ]
    },
    {
        "poolAddress": "0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c",
        "coins": [
            "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643",
            "0x39aa39c021dfbae8fac545936693ac917d5e7563",
            "0xdac17f958d2ee523a2206206994597c13d831ec7"
        ],
        "underlying": [
            "0x6b175474e89094c44da98b954eedeac495271d0f",
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "0xdac17f958d2ee523a2206206994597c13d831ec7"
        ]
    }
];

const fetcher = new CurvePriceFetcher({ web3, customPoolData });
```

finally, you can also pass in an array of addresses. you can then fetch pool metadata after creation and it will be used for subsequent pricing data.

```
const customPoolData = [
   {
       "poolAddress": "0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56"
   },
   {
       "poolAddress": "0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c"
   }
];

const fetcher = new CurvePriceFetcher({ web3, customPoolData });

await fetcher.getAllPoolMetaData();
```

### Fetching Prices:

Once you have your fetcher instantiated, you can fetch prices like so:

```
let prices = await fetcher.getPoolPrices(swapFrom, swapTo, '1000000000000000000000');

prices.forEach(
    pool => console.log(`Pool ${pool.poolAddress}: ${pool.price.toNumber()}`)
)
```

Prices are returned as a [BigNumber](https://github.com/MikeMcl/bignumber.js/) object

### Improvements

initially this was a quick and dirty script for a project i'm working on but then i packaged in a module. functionality is limited to fetching prices but some things that could be added (feel free to PR):

- take gas into account. the gas fees vary based on the underlying assets (quite vastly) due to different implementations, so the best price is not necessarily the best price.
- add support for performing swap
- route through multiple pools. for very large orders it will be more cost efficient to use multiple.
- fetch pool addresses from curve registry instead of json file. see here for details - https://www.curve.fi/contracts

### Examples

There's example code in the examples folder. To use this you can rename the .env.example file to .env and change your infura project id in the file. If using a local node, replace the provider in the example with the RPC url of your local node before running.