NUM_EMAILS=1000
NUM_MESSAGES=100000

stubs:
	node emails.js ${NUM_EMAILS} > from.json
	node emails.js ${NUM_EMAILS} > to.json
	node messages.js ${NUM_MESSAGES} > messages.json
