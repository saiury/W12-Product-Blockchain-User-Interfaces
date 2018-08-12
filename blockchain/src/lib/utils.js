import jsunicode from 'jsunicode';
import {ERROR_FETCH_LEDGER, UPDATE_META} from "../store/modules/Ledger";

const web3 = new Web3();

export function promisify (funct) {
    return function (...args) {
        return new Promise((accept, reject) => {
            const callback = function (error, result) {
                if (error != null) {
                    reject(error);
                } else {
                    accept(result);
                }
            };

            return funct(...args, callback);
        });
    };
}

export function waitTransactionReceipt(tx, web3, timeout = 240000) {
    return new Promise(function (accept, reject) {
        const start = new Date().getTime();

        const make_attempt = () => {
            web3.eth.getTransactionReceipt(tx, function (err, receipt) {
                if (err && !err.toString().includes('unknown transaction')) {
                    return reject(err);
                }

                if (receipt != null) {
                    if (parseInt(receipt.status, 16) == 0) {
                        return reject(new Error('status error'), tx, receipt);
                    } else {
                        return accept({
                            tx: tx,
                            receipt: receipt
                        });
                    }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                    return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
            });
        };

        make_attempt();
    });
}

export function wait(ms) { return new Promise(rs => setTimeout(rs, ms)); }

export function decodeStringFromBytes(bytesString) {
    bytesString = bytesString.indexOf('0x') === 0 ? bytesString.slice(2) : bytesString;

    return jsunicode.decode(bytesString, jsunicode.constants.encoding.utf16);
}

export function encodeStringToBytes (string) {
    return '0x' + jsunicode.encode(string, jsunicode.constants.encoding.utf16);
}

export function countStringBytes (string) {
    return jsunicode.encode(string, jsunicode.constants.encoding.utf16).length / 2;
}

export function isZeroAddress(address) {
    try {
        return /^0x$/.test(address) || web3.toBigNumber(address).eq(0);
    } catch (e) {
        return false;
    }
}

