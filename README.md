curve-simple-router is a node package for interacting with curve smart contracts and fetching the best pool for transacting swaps.

to use the package, you will need to pass in a web3 provider.

examples:

1. use the hardcoded set of pools to fetch prices.

2. pass in a custom list of pools. this will fetch the pool metadata on creation and use it for subsequent pricing data.