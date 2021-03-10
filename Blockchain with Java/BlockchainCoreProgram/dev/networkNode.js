// (1)express import
const express = require('express');
var app = new express();
// (2)body-parser import
const bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
// (3)blockchain import
const Blockchain = require('./blockchain');
var bitcoin = new Blockchain();
// (4)uuid import
const {v1:uuid} = require('uuid');
var nodeAddress = uuid().split('-').join('');
// (5)request-promise import/register-and-broadcast-node
const rp = require('request-promise');
const requestPromise = require('request-promise');

//'/blockchain'으로 url로 호출할 때 req-수신, res-송신
app.get('/blockchain',function(req,res) 
{
    //bitcoin이라는 객체를 송신
    res.send(bitcoin);
});

//'/transaction'으로 url로 호출할 때 (req-수신, res-송신) 수신한 transaction 추가
app.post('/transaction',function(req,res) 
{
    //newTransaction은 수신받은 body의 값을 변수에 저장
    const newTransaction = req.body;
    //blockIndex는 bitcoin 객체의 맴버함수 addT~에 변수 newTrnasaction을 argu로 넣고 나오는 return값을 변수에 저장
    const blockIndex = bitcoin.addTransactionTonewTransactions(newTransaction);
    // //Test
    // const blockIndex = bitcoin.createNewTransaction(
    //     req.body.amount,
    //     req.body.sender,
    //     req.body.recipient);
    //
    res.json({ note:`Transaction will be added in block ${blockIndex}.`});
});

//'/receive-new-block'으로 url호출할 때 수신한 newBlock 해쉬값과 인덱스 값이 이전 블록과 같은지 확인하고 맞으면 chain 배열에 push한다.
app.post('/receive-new-block',function(req, res) {
    //수신하는 body의 newBlock을 newBlock 변수에 저장
    const newBlock = req.body.newBlock;
    //bitcoin 객채의 맴버함수 getLastBlock을 호출하여 받은 retrun 값을 변수 lastBlock에 저장
    const lastBlock = bitcoin.getLastBlock();
    //lastBlock 변수의 key hash의 타입과 값이 newBlock 변수의 preBolckHash 값과 같다면 true 값을 저장 
    const correctHash = lastBlock.hash === newBlock.preBlockHash;
    //lastBlock의 key index의 값에 정수 1을 더한 것과 newBlock의 key index의 타입과 값이 동일하면 true 값을 저장
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
    //correctHash와 correctIndex가 true면 bitcoin 객체의 chain 배열에 newBlock 변수를 push하고 json 형태로 포맷하여 전송한다. 
    if(correctHash && correctIndex) 
    {
        bitcoin.chain.push(newBlock);
        bitcoin.newTransactions = [];
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        });
    //correctHash와 correctIndex가 true가 아니면 push하지 않고 json문으로 전송한다.
    } else{
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        });
    }
});

//'/mine'
app.post('/mine',function(req,res) 
{
    const lastBlock = bitcoin.getLastBlock();
    const preBlockHash = lastBlock['hash'];
    const curBlockData = {
        transaction : bitcoin.newTransactions,
        index : lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(preBlockHash,curBlockData);
    const blockHash = bitcoin.hashBlock(preBlockHash,curBlockData,nonce);
    const newBlock = bitcoin.createNewBlock(nonce,preBlockHash,blockHash);
    
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        //console.log('networkNodeUrl:'+networkNodeUrl + '/receive-new-block');
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {newBlock: newBlock},
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: '00',
                recipient: nodeAddress
            },
            json: true
        };
        return rp(requestOptions);
    }).then(data => {
        res.json({
            note:'New block mind & broadcast successfully',
            block: newBlock
        });
    });

    // //Testcode
    // //새로운 블록을 다른 노드들에게 통지
    // res.json({note:"New block mined successfully",block:newBlock});
    // //새로운 블록을 채굴한 것에 대한 보상 처리
    // //2018년 기준 보상은 12.5BTC, sender가 "00"이면 보상의 의미
    // bitcoin.createNewTransaction(12.5,"00",nodeAddress);
});

//
app.post('/transaction/broadcast',function(req,res)
{
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionTonewTransactions(newTransaction);

    const requestPromise = [];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        requestPromise.push(rp(requestOptions));
    });

    Promise.all(requestPromise)
    .then(data=> {
        res.json({note: 'Transaction created and broadcast successfully.' });
    });
});

//자신의 서버에 등록하고 전체 네트워크에 브로드캐스팅
app.post('/register-and-broadcast-node',function(req,res) {
    const newNodeUrl = req.body.newNodeUrl;//등록요청 URL

    //배열 networkNodes에서 없으면 추가
    if (bitcoin.networkNodes.indexOf(newNodeUrl)==-1)
    {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    const regNodesPromises = [];//promise 객체들을 저장하는 배열

    //다른 노드에게 브로드캐스팅
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };
        //requestOption 객체를 배열에 입력
        regNodesPromises.push(rp(requestOption));
    });

    //promise 객체들을 비동기 실행
    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method:'POST',
            body:{allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
            json: true
        };
        return rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({note: 'New Node registered with network successfully'});
    });       
});

//새로 등록 요청받은 노드를 자신의 서버에 등록
app.post('/register-node',function(req,res) {
    const newNodeUrl = req.body.newNodeUrl;//등록 요청 URL
    //배열 networkNodes에 없으면 true, 있으면 false
    const nodeNotExist = (bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    //currentNodeUrl과 newNodeUrl이 다르면 true, 같아면 false
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    
    //기존에 없고 현재 노드의 url과 다르면 추가
    if (nodeNotExist && notCurrentNode)
    {
        bitcoin.networkNodes.push(newNodeUrl);
    }

    //등록 요청에 대한 회신
    res.json({note:'New node registered successfully'});
});

//여러개의 노드를 자신의 서버에 한번에 등록
app.post('/register-nodes-bulk',function(req,res) {
    const allNetworkNodes = req.body.allNetworkNodes;

    allNetworkNodes.forEach(networkNodeUrl=>{
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;

        if(nodeNotAlreadyPresent && notCurrentNode)
        {
            bitcoin.networkNodes.push(networkNodeUrl);
        } 
    });
    res.json({note: 'Bulk registration successful.'});
});

app.get('/consensus',function(req,res) {
    const requestPromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl=> {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(blockchains =>{
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newTransactions = null;

        //가장 긴 블록체인을 검색
        blockchains.forEach(blockchain =>{
            if (blockchain.chain.length>maxChainLength) {
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newTransactions = blockchain.newTransactions;
            };
        });

        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain)))
        {
            res.json({
                note: 'Current chain has not been replaced.',
                chain: bitcoin.chain
            });
        } else {
            bitcoin.chain = newLongestChain;
            bitcoin.newTransactions = newTransactions;
            res.json({
                note: 'This chain has been replaced.',
                chain: bitcoin.chain
            });
        }
    });
});

// //(1)-1.test
// app.get('/',function(req,res) 
// {
//     res.send('Hellow World!');
// });
// app.listen(3000);
// //웹 브라우저 주소창에서 'localhost:3000' 입력 후 실행

// //(1)-2.'/transaction' test 포스트 함수 활용하여 작동하는지 확인
// app.post('/transaction',function(req,res)
// {
//     res.send('It works');
// });

// //(2)-1.'/transaction' test 웹에서 받은 요청(req)를 출력하고 요청 결과를 반환(res)
// app.post('/transaction',function(req,res)
// {
//     //요청 내용을 콘솔에 출력
//     console.log(req.body);
//     //요청 결과를 문자열로 반환
//     res.send(`The amount of the transaction is ${req.body.amount} bitcoin from ${req.body.sender} to ${req.body.recipient}.`);
// });

// // (3) test - Chrome 확장 프로그램 JSON formmater 이용
// app.get('/blockchain',function(req,res) 
// {
//     res.send(bitcoin);
// });

//서로 다른 포트에서 실행되도록 하기 위해 포트를 파라미터로 설정
const port = process.argv[2];
app.listen(port, function() {console.log(`listening on port ${port}...`)});
