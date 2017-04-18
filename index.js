'use strict';

const p = require('path');
const crypto = require('crypto');
const fs = require('fs');
const HOME = require('os').homedir();

class TokenStore { 

	constructor (options) {

		this.opts = Object.assign({
			mkdir: true,
			signature: [],
			filename: 'token',
			ext: 'json',
			path: '$HOME/.credentials'
		}, options);

		// bash expansion
		let path = this.opts.path.replace(/^~|^\$HOME/, HOME);

		// check if directory exists
		let exists = fs.existsSync(path);

		if(!exists){
			if(this.opts.mkdir){
				fs.mkdirSync( path );
			}
			else{
				throw new Error( path + ' does not exist' );
			}
		}

		let filename = [this.opts.filename];

		if( this.opts.signature.length ){
			let signature = crypto.createHash('md5').update( this.opts.signature.join() ).digest('hex');
			filename.push(signature);
		}

		filename = `${ filename.join('-') }.${ this.opts.ext }`; 

		this.path = p.resolve( path, filename );
	}

	get () {

		let contents;

		try {
			contents = fs.readFileSync( this.path );
		}
		catch(e){
			if(e.code === 'ENOENT'){
				throw new Error('token has not been stored');
			}
		}

		if(this.opts.ext == 'json'){

			try{
				contents = JSON.parse(contents);
			}
			catch(e){
				throw new Error('token is not stored as valid json');
			}
		}
	}

	store (token) {
		if(!token) throw new Error('token must be provided');

		if( typeof token !== 'string' ){

			if(this.opts.ext == 'json'){

				token = JSON.stringify(token);
			}
			else{
				throw new Error('token must be a string');
			}
		}

		fs.writeFileSync( this.path, token );
	}
}

module.exports = TokenStore;
