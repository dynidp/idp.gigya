import createHmac from "create-hmac";
const hmac = createHmac("sha256", "hello world").update("I love cupcakes").digest("hex");
console.log(hmac);
