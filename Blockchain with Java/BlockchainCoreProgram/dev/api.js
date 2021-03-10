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

//
app.post('/blockchain',function(req,res) 
{
    res.send(bitcoin);
});
app.post('/transaction',function(req,res) 
{
    const blockIndex = bitcoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient);

    res.json({ note:`Transaction will be added in block ${blockIndex}.`});
});
app.post('/mine',function(req,res) 
{
    const lastBlock = bitcoin.getLastBlock();
    const preBlockHash = lastBlock['hash'];
    const curBlockData = {
        transaction : bitcoin.newTransactions,
        Index : lastBlock['index'] + 1
    };
    const nonce = bitcoin.proofOfWork(preBlockHash,curBlockData);
    const blockHash = bitcoin.hashBlock(preBlockHash,curBlockData,nonce);
    const newBlock = bitcoin.createNewBlock(nonce,preBlockHash,blockHash);

    //새로운 블록을 다른 노드들에게 통지
    res.json({note:"New block mined successfully",block:newBlock});
    //새로운 블록을 채굴한 것에 대한 보상 처리
    //2018년 기준 보상은 12.5BTC, sender가 "00"이면 보상의 의미
    bitcoin.createNewTransaction(12.5,"00",nodeAddress);
});

app.listen(3000,function() {console.log('listening on port 3000...')});


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