import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import axios from 'axios';
import getTokenCredentials from "./secret";
import Web3 from "web3";
const snftABI = require('./abi.json');

export const snft: APIGatewayProxyHandler = async (lambdaEvent, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let statusCode = 200;
  let message;
  try {
    const postParams = JSON.parse(lambdaEvent.body);
    if (!postParams.tokenId) {
      statusCode = 500;
      message = 'No Token Id';
    } else {
      const t = await getTokenCredentials();
      const tObj = JSON.parse(t);
      const testnet = `${process.env.INFURA_URL}${tObj.PROVIDER_ACCESS_TOKEN}`;
      const web3 = new Web3(new Web3.providers.HttpProvider(testnet));
      web3.eth.defaultAccount = tObj.OWNER_ADDRESS;
      const wallet = web3.eth.defaultAccount;
      const theContract = new web3.eth.Contract(snftABI, tObj.NFT_CONTRACT_ADDRESS);
      const ipfsHash = await theContract.methods.tokenURI(postParams.tokenId).call({from: wallet});
      const ipfsResponse = await axios({
        method: 'get',
        url: ipfsHash,
      });
      const { data } = ipfsResponse;
      message = JSON.stringify(data);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.log(`error ${JSON.stringify(error)}`);
    statusCode = 500;
    message = JSON.stringify(error);
  }

  return {
    statusCode,
    body: message,
  };
};
