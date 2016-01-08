module.exports = referenceImplementation;

var http = require('http');

function referenceImplementation(messages, rules) {
	return new Promise((accept, reject) => {
		try {
			var options = {
				hostname: 'hola.org',
				port: 80,
				path: '/challenge_mail_filter/reference',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			};

		  var requestData = JSON.stringify({
				messages: messages,
				rules: rules
			});

			var request = http.request(options);
			request.write(requestData);

			request.on('response', response => {
				response.on('data',responseData => {
					try {
						accept(JSON.parse(responseData.toString()));
					}
					catch (ex) {
						console.log(requestData);
						console.log(responseData.toString());
						reject({
							data: data,
							exception: ex
						});
					}
				});
			});
			request.end();
		}
		catch (ex) {
			reject(ex);
		}
	});
};
