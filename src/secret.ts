const { SecretsManagerClient,
        GetSecretValueCommand
      } = require('@aws-sdk/client-secrets-manager');

const REGION = "us-east-1";

const params = {
  SecretId: process.env.SECRET_PARAM,
};

const secretsManagerClient = new SecretsManagerClient({ region: REGION });

const getTokenCredentials = async () => {
  let data;
  try {
    data = await secretsManagerClient.send(new GetSecretValueCommand(params));
  } catch (err) {
    console.log('ERR '+ err);
  }
  let secret;
  if("SecretString" in data) {
    secret = data.SecretString;
    console.log(`SECRET ${JSON.stringify(secret)}`);
  } else {
    console.log('else: ', data);
    // @ts-ignore
    const buff = new Buffer(data.SecretBinary, "base64");
    secret = buff.toString("ascii");
  }
  return secret;
};

export default getTokenCredentials;
