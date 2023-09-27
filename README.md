# NFT Marketplace Frontend

- This is nextjs frontend with integration of Moralis indexer for indexing marketplace events.
- Nextjs API feature is also used in this code for recieving event Notifications.

## Features

- Mint NFT
- Listing NFT for sale
- Modifying NFT listing Price
- Cancel NFT listing
- Buying NFT'S
- View transaction history
- Withraw Revenue (for NFT seller)

## Installation

Install packages

Yarn

```bash
  yarn install
```

Npm

```bash
    npm install
```

## Environment Variables

To run this project, you want to add the following environment variables to your .env file

`NEXT_PUBLIC_MONGO_DB`="MONGODB_CLUSTER_LINK"

`NEXT_PUBLIC_PINATA_API_KEY`="YOUR_PINATA_API_KEY"

`NEXT_PUBLIC_PINATA_SECRET_API_KEY`="YOUR_PINATA_API_SECRET"

## Run Locally

To run The Marketplace Locally

Yarn

```bash
  yarn run dev
```

Npm

```bash
  npm run dev
```
