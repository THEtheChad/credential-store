const assert = require('assert');
const path = require('path');
const Tstore = require('../');
const mock = require('mock-fs');
const fs = require('fs');

const HOME = require('os').homedir();
const CREDENTIALS = HOME + '/.credentials';

mock({
  [ HOME ]: {},
  [ HOME + '/.credentials' ]: {
  	'invalid.json': 'sjdfjdf',
  	'valid.json': '{"valid":true}'
  }
});

describe('TokenStore', function(){

	describe('#constructor', function(){

		it('should expand tilde', function(){

			let tstore = new Tstore({
				path: '~/.credentials',
			});

			let match = new RegExp('^' + HOME);

			assert.ok( match.test( tstore.path ) );
		});

		it('should expand $HOME', function(){

			let tstore = new Tstore({
				path: '$HOME/.credentials',
			});

			let match = new RegExp('^' + HOME);

			assert.ok( match.test( tstore.path ) );
		});

		it('should throw an error when passed {mkdir:false} alongside a missing path', function(){

			assert.throws(function(){

				let tstore = new Tstore({
					path: '$HOME/.bleep',
					mkdir: false
				});
			});
		});

		it('should create a directory when path is missing', function(){

			let tstore = new Tstore({
				path: '$HOME/.bleep'
			});

			assert.ok( fs.existsSync(HOME + '/.bleep') );
		});

		it('should create a unique md5 hash when passed signature info', function(){

			let tstore = new Tstore({
				path: '$HOME/.bleep',
				signature: [123,456]
			});
		});
	});

	describe('#get', function(){

		it('should throw an error if a token does not exist', function(){

			let tstore = new Tstore({
				filename: 'nonexistent',
				path: '$HOME/.credentials'
			});

			assert.throws(function(){

				tstore.get();
			});
		});


		it('should throw an error if set to json and unable to parse token', function(){

			let tstore = new Tstore({
				filename: 'invalid',
				path: '$HOME/.credentials'
			});

			assert.throws(function(){

				tstore.get();
			});
		});

		it('should not throw an error if token is valid json', function(){

			let tstore = new Tstore({
				filename: 'valid',
				path: '$HOME/.credentials'
			});

			tstore.get();
		});

	});

	describe('#store', function(){

		it('should store any valid string', function(){

			let token = 'test';

			let tstore = new Tstore();

			tstore.store(token);

			let result = fs.readFileSync( CREDENTIALS + '/token.json', 'UTF8' );

			assert.equal(token, result);
		});

		it('should stringify json by default', function(){

			let token = {test:true};

			let tstore = new Tstore();

			tstore.store(token);

			let result = fs.readFileSync( CREDENTIALS + '/token.json', 'UTF8' );

			assert.deepEqual(token, JSON.parse(result));
		});

		it('should throw when called with no token', function(){

			let tstore = new Tstore();

			assert.throw(function(){

				tstore.store();
			});
		});
	});
});
