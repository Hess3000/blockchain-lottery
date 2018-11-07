const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile')

let accounts;
let lottery;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data : bytecode })
		.send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery contract', () => {
	it('deploys a contract', () => {
		assert.ok(lottery.options.address);
	});

	it('allows one account to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	it('allows multiple accounts to enter', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});

		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});

		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], [players[1]])
		assert.equal(2, players.length);
	});

	it('requires a minimum amount of ether to enter', async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: web3.utils.toWei('0.01', 'ether')
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});

	it('requires manager to pick winner', async () => {

		let e;

			await lottery.methods.enter().send({
				from: accounts[0],
				value: web3.utils.toWei('0.2', 'ether')
			});

			await lottery.methods.enter().send({
				from: accounts[1],
				value: web3.utils.toWei('0.2', 'ether')
			});
	    try {
		    	e = await lottery.methods.pickWinner().send({
					from: accounts[1]
				});
		    }	catch (err) {
		    	assert(err);
		    	console.log(err)
					return;
			}	
			
			assert(false)

	});

	it('sends money to the winner and resets the players array', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		});
		
		const balanceBefore = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({
			from: accounts[0]
		});
		const balanceAfter = await web3.eth.getBalance(accounts[0]);
		const difference = (balanceAfter - balanceBefore )
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		const balance = await lottery.methods.bal().call();

		assert(balance == 0 )
		assert(players.length == 0)
		assert( difference > web3.utils.toWei('1.8', 'ether'));
	});

});
















