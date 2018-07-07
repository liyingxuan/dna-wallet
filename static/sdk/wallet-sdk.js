const ecurve = require('ecurve');
const BigInteger = require('bigi');
const secp256r1 = require('secp256k1');
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = require('base-x')(BASE58);



/**
 * Transaction const.
 *
 * @type {string}
 */
const TRANSACTION_VERSION = '00';
const TRANSACTION_TYPE = {
  TRANSFER: '80'
};
const ACCURACY_VAL = 100000000;
const RANDOM_VAL = 99999999;
const ADDRESS_FIRST_CODE = 23; // 可以修改这个值来决定地址首字母是什么



/**************************************************************************************************
 * Wallet API Class.
 *
 * @constructor
 */
const Wallet = function Wallet() {};

/**
 * Generate random privateKey
 *
 * @return {*}
 */
Wallet.generateRandomPrivateKey = function() {
  let privateKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privateKey[i] = Math.floor(Math.random() * 256);
  }

  return WalletTool.ab2hexStr(privateKey);
};

/**
 * PrivateKey generate accountInfo
 *
 * $accountInfo format:
 * privateKey
 * publicKeyEncoded
 * publicKey
 * programHash
 * address
 *
 * @param $privateKey
 * @return {*}
 * @constructor
 */
Wallet.GetAccountInfoFromPrivateKey = function($privateKey) {
  if ($privateKey.length !== 64) return -1;

  let publicKeyEncoded = Wallet.getPublicKey($privateKey, true);
  let script = Wallet.createSignatureScript(publicKeyEncoded);
  let programHash = Wallet.getHash(script);
  let address = Wallet.toAddress(WalletTool.hexStr2ab(programHash.toString()));

  return {
    privateKey: $privateKey,
    publicKeyEncoded: publicKeyEncoded,
    publicKey: publicKeyEncoded.toString('hex'),
    programHash: programHash.toString(),
    address: address
  };
};

/**
 * privateKey to publicKey
 *
 * @param $privateKey
 * @param $encode
 * @return {*}
 */
Wallet.getPublicKey = function($privateKey, $encode) {
  let ecParams = ecurve.getCurveByName('secp256r1');
  let curvePt = ecParams.G.multiply(BigInteger.fromBuffer(WalletTool.hexStr2ab($privateKey)));

  return curvePt.getEncoded($encode);
};

/**
 * @param $signatureScript
 * @return {*}s
 */
Wallet.getHash = function($signatureScript) {
  let ProgramHexString = CryptoJS.enc.Hex.parse($signatureScript);
  let ProgramSha256 = CryptoJS.SHA256(ProgramHexString);

  // 160bit hash，20 BYTE
  return CryptoJS.RIPEMD160(ProgramSha256);
};

/**
 * 21: length; ac: Single sign; ae: More sign
 *
 * @param $publicKeyEncoded
 * @return {string}
 */
Wallet.createSignatureScript = function($publicKeyEncoded) {
  return '21' + $publicKeyEncoded.toString('hex') + 'ac';
};

/**
 * Program hash to address.
 *
 * @param $programHash
 *
 * @return {*}
 */
Wallet.toAddress = function($programHash) {
  let data = new Uint8Array(1 + $programHash.length);
  data.set([ADDRESS_FIRST_CODE]);
  data.set($programHash, 1);

  let ProgramHexString = CryptoJS.enc.Hex.parse(WalletTool.ab2hexStr(data));
  let ProgramSha256 = CryptoJS.SHA256(ProgramHexString);
  let ProgramSha256_2 = CryptoJS.SHA256(ProgramSha256);
  let ProgramSha256Buffer = WalletTool.hexStr2ab(ProgramSha256_2.toString());

  let dataArr = new Uint8Array(1 + $programHash.length + 4);
  dataArr.set(data);
  dataArr.set(ProgramSha256Buffer.slice(0, 4), 21);

  return base58.encode(dataArr);
};

/**
 * Address to program hash.
 *
 * @param $address
 * @return {number}
 *
 * @constructor
 */
Wallet.toProgramHash = function($address) {
  let ProgramHash = base58.decode($address);
  let ProgramHexString = CryptoJS.enc.Hex.parse(WalletTool.ab2hexStr(ProgramHash.slice(0, 21)));
  let ProgramSha256 = CryptoJS.SHA256(ProgramHexString);
  let ProgramSha256_2 = CryptoJS.SHA256(ProgramSha256);
  let ProgramSha256Buffer = WalletTool.hexStr2ab(ProgramSha256_2.toString());

  if (WalletTool.ab2hexStr(ProgramSha256Buffer.slice(0, 4)) !== WalletTool.ab2hexStr(ProgramHash.slice(21, 25))) {
    return -1;
  }

  return WalletTool.ab2hexStr(ProgramHash.slice(1, 21));
};

/**
 * Analyze coins.
 *
 * @param utxos
 * @return {Array}
 */
Wallet.analyzeCoins = function(utxos) {
  let newCoins = [];

  if (utxos !== null) {
    let coins = [];
    let tmpIndexArr = [];

    for (let i = 0; i < utxos.length; i++) {
      coins[i] = utxos[i];
      coins[i].balance = 0;
      coins[i].balanceView = 0;
      coins[i].balanceViewFormat = 0;
      coins[i].AssetID = WalletTool.ab2hexStr(WalletTool.hexStr2ab(utxos[i]['AssetId']));
      coins[i].AssetIDRev = WalletTool.ab2hexStr(WalletTool.reverseArr(WalletTool.hexStr2ab(utxos[i]['AssetId'])));
      if (utxos[i].Utxo != null) {
        for (let j = 0; j < utxos[i].Utxo.length; j++) {
          coins[i].balance = WalletMath.add(coins[i].balance, utxos[i].Utxo[j].Value);
        }
        coins[i].balanceView = WalletMath.fixView(coins[i].balance);
        coins[i].balanceViewFormat = WalletMath.toThousands(coins[i].balanceView);
      }

      tmpIndexArr.push(utxos[i].AssetName);
    }

    /**
     * Sorting.
     * @type {Array.<*>}
     */
    tmpIndexArr = tmpIndexArr.sort();
    for (let i = 0; i < utxos.length; i++) {
      for (let j = 0; j < utxos.length; j++) {
        if (tmpIndexArr[i] === utxos[j].AssetName) {
          newCoins.push(utxos[j]);
        }
      }
    }
  }

  return newCoins;
};



/**************************************************************************************************
 * Transaction Class
 *
 * @constructor
 */
const Transaction = function () {};

/**
 * Random num.
 *
 * BYTE                 CONTENT
 * 1                    Transaction attributes count: 01
 * 1                    Transaction attributes usage
 * 8                    Transaction attributes data length
 * data actual length   Transaction attributes data
 */
Transaction.randomNumAttr = function () {
  // Random num
  let attrNum = "01";
  let attrUsage = "00";
  let attrData = WalletTool.ab2hexStr(WalletTool.strToBytes(parseInt(RANDOM_VAL * Math.random())));
  let attrDataLen = WalletTool.prefixInteger(Number(attrData.length / 2).toString(16), 2);

  return attrNum + attrUsage + attrDataLen + attrData;
};

/**
 * Signature transaction unsigned Data.
 *
 * @param $data
 * @param $privateKey
 *
 * @return {string}
 */
Transaction.signatureData = function($data, $privateKey) {
  let msg = CryptoJS.enc.Hex.parse($data);
  let msgHash = CryptoJS.SHA256(msg);
  let signature = secp256r1.sign(new Buffer(msgHash.toString(), "HEX"), new Buffer($privateKey, "HEX"));

  return signature.signature.toString('hex');
};

/**
 * Increase the signature, public key part, validation script
 *
 * BYTE                       CONTENT
 * 1                          Program length: 0x01
 * 1                          Parameter length
 * parameter actual length 	  Parameter: signature
 * 1			                    Code length
 * code actual length         Code: publicKey
 *
 * @param $txData
 * @param $sign
 * @param $publicKeyEncoded
 * @return {string}
 */
Transaction.addContract = function($txData, $sign, $publicKeyEncoded) {
  // no signature
  if ($sign === '') return $txData + '00'

  // have signature
  let num = "01";
  let structureLen = "41";
  let dataLen = "40";
  let data = $sign;
  let contractDataLen = "23";
  let signatureScript = Wallet.createSignatureScript($publicKeyEncoded);

  return $txData + num + structureLen + dataLen + data + contractDataLen + signatureScript;
};

/**
 * 配合后端的WriteVarUint
 *
 * @param orderNum
 * @return {{firstVal: *, length: number, inputNum: string}}
 * @constructor
 */
Transaction.InputDataLength = function(orderNum) {
  let firstVal = orderNum + 1;
  let len = 0;
  let inputNum = orderNum + 1;

  if (orderNum < 253) { // 0xFD
    len = 1;
    inputNum = WalletTool.numStoreInMemory(inputNum.toString(16), 2)
  } else if (orderNum < 65535) { // 0xFFFF
    firstVal = 253;
    len = 3;
    inputNum = WalletTool.numStoreInMemory(inputNum.toString(16), 4)
  } else if (orderNum < 4294967295) { // 0xFFFFFFFF
    firstVal = 254;
    len = 5;
    inputNum = WalletTool.numStoreInMemory(inputNum.toString(16), 8)
  } else {
    firstVal = 255;
    len = 9;
    inputNum = WalletTool.numStoreInMemory(inputNum.toString(16), 16)
  }

  return {
    firstVal: WalletTool.numStoreInMemory(firstVal.toString(16), 2),
    length: len,
    inputNum: inputNum
  }
};

/**
 * 构造输出数据
 *
 * @param $coin
 * @param $amount
 * @return {*}
 * @constructor
 */
Transaction.GetInputData = function($coin, $amount) {
  // sort
  let coin_ordered = $coin['Utxo'];
  for (let i = 0; i < coin_ordered.length - 1; i++) {
    for (let j = 0; j < coin_ordered.length - 1 - i; j++) {
      if (WalletMath.lt(coin_ordered[j]['Value'], coin_ordered[j + 1]['Value'])) {
        let temp = coin_ordered[j];
        coin_ordered[j] = coin_ordered[j + 1];
        coin_ordered[j + 1] = temp;
      }
    }
  }

  // calc sum
  let sum = 0;
  for (let i = 0; i < coin_ordered.length; i++) {
    sum = WalletMath.add(sum, coin_ordered[i]['Value']);
  }

  // if sum < amount then exit;
  let amount = $amount;
  if (WalletMath.lt(sum, amount)) return -1;

  // find input coins
  let k = 0;
  while (WalletMath.lessThanOrEqTo(coin_ordered[k]['Value'], amount)) {
    amount = WalletMath.sub(amount, coin_ordered[k]['Value']);
    console.log(amount.toString())
    if (WalletMath.eq(amount, 0)) break;
    k = k + 1;
  }

  // calc length
  let lengthData = Transaction.InputDataLength(k);

  /////////////////////////////////////////////////////////////////////////
  // coin[0]- coin[k]
  let data = new Uint8Array(lengthData.length + 34 * (k + 1));

  // input num
  if (lengthData.length === 1) {
    data.set(WalletTool.hexStr2ab(lengthData.inputNum));
  } else {
    data.set(WalletTool.hexStr2ab(lengthData.firstVal));
    data.set(WalletTool.hexStr2ab(lengthData.inputNum), 1);
  }

  // input coins
  for (let x = 0; x < k + 1; x++) {
    // txid
    let pos = lengthData.length + (x * 34);
    data.set(WalletTool.reverseArr(WalletTool.hexStr2ab(coin_ordered[x]['Txid'])), pos);

    // index
    pos = lengthData.length + (x * 34) + 32;
    let inputIndex = WalletTool.numStoreInMemory(coin_ordered[x]['Index'].toString(16), 4);
    data.set(WalletTool.hexStr2ab(inputIndex), pos);
  }

  // calc coin_amount
  let coin_amount = 0;
  for (let i = 0; i < k + 1; i++) {
    coin_amount = WalletMath.add(coin_amount, coin_ordered[i]['Value']);
  }

  return {
    amount: coin_amount,
    data: data
  }
};

/**
 * Make Transfer
 *
 * BYTE           CONTENT
 * 1              Type: 80
 * 1              Version: 00
 *
 * 1              Transaction input count：01
 * 1              交易属性中的用法
 * 8              交易属性中的数据长度
 * 数据实际长度     交易属性中的数据
 *
 * 1              Transaction output count：个数为0时，则无
 * 32             引用交易的hash：个数为0时，则无
 * 2              引用交易输出的索引：个数为0时，则无
 *
 * 1              交易输出类型: 01为全部转账；02位有找零
 * 32             Asset ID
 * 8              Asset num
 * 20             Asset acceptor ProgramHash
 *
 * 32             找零转账资产ID，仅在交易输出类型为02时有
 * 8              找零转账资产数量，仅在交易输出类型为02时有
 * 20             找零转账资产ProgramHash，仅在交易输出类型为02时有
 *
 * 1 	            Signature: yes
 *
 * @param $coin
 * @param $assetID
 * @param $amount
 * @param $toAddress
 * @param $accountInfo
 * @return {*}
 */
Transaction.makeTransfer = function($coin, $assetID, $amount, $toAddress, $accountInfo) {
  /************
   * 准备数据
   */
    // Input Construct
  let inputData = Transaction.GetInputData($coin, $amount);
  if (inputData === -1) return null;
  let inputAmount = inputData.amount;

  // Adjust the accuracy （调整精度之后的数据）
  let newOutputAmount = WalletMath.mul($amount, ACCURACY_VAL);
  let newInputAmount = WalletMath.sub(WalletMath.mul(inputAmount, ACCURACY_VAL), newOutputAmount);

  /************
   * 构造交易数据
   */
    // Base
  let type = TRANSACTION_TYPE.TRANSFER;
  let version = TRANSACTION_VERSION;

  // 自定义属性,Attributes: Random num
  let attr = this.randomNumAttr();

  // Input Data: When input or input is 0, there is no additional parameter
  let finallyInputData = WalletTool.ab2hexStr(inputData.data);

  // Output Data: Asset ID、Asset num、Asset acceptor ProgramHash
  let outputNum = "01";
  let assetID = WalletTool.reverseStr($assetID);
  let amount = WalletTool.numStoreInMemory(($amount * ACCURACY_VAL).toString(16), 16);
  let programHash = Wallet.toProgramHash($toAddress);

  let outputData = '';
  if (WalletMath.eq(inputAmount, $amount)) {
    outputData = outputNum + assetID + amount + programHash;
  } else {
    outputNum = "02"; //有找零
    // Transfer to someone. 发给他人
    outputData = outputNum + assetID + amount + programHash;

    // Change to yourself. 找零给自己
    let outputValue_me = WalletTool.numStoreInMemory(WalletMath.toHex(newInputAmount), 16);
    let outputProgramHash_me = $accountInfo.programHash;

    outputData += assetID + outputValue_me + outputProgramHash_me;
  }

  let txData = type + version
    + attr + finallyInputData
    + outputData;

  let signatureData = Transaction.signatureData(txData, $accountInfo.privateKey);

  return this.addContract(txData, signatureData, $accountInfo.publicKeyEncoded);
};
