/*import crypto from 'crypto'
 

const SigUtils = {
    calcSignature(baseString:string, key:string) {
        
        const rawHmac = crypto.createHmac('sha1', Buffer.from(key, 'base64')).update(baseString);
        const signature = rawHmac.digest('base64');
        return signature;
    },

    validateUserSignature(UID:string, timestamp:number, secret:string, signature:string) {
        const now = Math.round(Date.now() / 1000);
        if (Math.abs(now - timestamp) > 180) {
            return false;
        }
        const baseString = `${timestamp}_${UID}`;
        const expectedSig = SigUtils.calcSignature(baseString, secret);
        return (expectedSig === signature);
    }
};*/
// import createHmac from "create-hmac";

async function importKey(secret:string) {
    return await crypto.subtle.importKey(
        
        'raw',
        Buffer.from(secret),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign', 'verify'],
    )
}


async function signWithCryptoSubtle(secret: string, message: string) {
    const key = await importKey(secret);
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(message),
    )


    //Convert ArrayBuffer to Base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

const getUtf8Bytes = (str:string) =>
    new Uint8Array(
        [...unescape(encodeURIComponent(str))].map(c => c.charCodeAt(0))
    );



async function calcSignature(message:string, secret:string) {
    const secretBytes = getUtf8Bytes(secret);
    const messageBytes = getUtf8Bytes(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw', secretBytes, { name: 'HMAC', hash: 'SHA-1' },
        true, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);

// to lowercase hexits
    [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');

// to base64
    replace(btoa(String.fromCharCode(...new Uint8Array(sig))));

}
/*async function calcSignature_(message:string, secret:string) {
 
    const hasher = createHmac('sha1', Buffer.from(secret));
    hasher.update(message);
    return hasher.digest('base64');
 }*/
function replace(source:string){
    return source.replace("/=$/", "")
    .replace("/=$/", "" )
    .replace("/[+]/", "-" )
    .replace("/\//", "_");

}


async function calcSig(dataObj:{[key:string]: any}, application: Application) {
return calcSignature(JSON.stringify(dataObj), application.secret);
}

export async function getFakeConsent({ application, user , params}: { application: Application; user: UIDParams, params:Context}) {
    // $scope = preg_replace('/[+]/', ' ', $scope); // Important: scope string must contain white-space spaces, not '+' or '%2b' or sig validation will fail.
    const consentObj = {
        clientID: params.clientID,
        scope: params.scope,
        context: params.context,
        UID: user.UID,
        consent:true

    };
    
    const consent=JSON.stringify(consentObj);

    return {
        consent,
        uidSignature: user.UIDSignature,
        signatureTimestamp: user.signatureTimestamp,
        signature: await calcSignature(consent, application.secret),
        userKey: application.key
    }





}


export type UIDParams= {
    UID: string,
    UIDSignature: string,
    signatureTimestamp: string
}
export type Context= {
    clientID?: string,
    scope?: string,
    context?: string
    [key:string]: any
}

export type Application={
    key:string,
    secret:string
}