const faker = require('faker');

const count = 100;


const leaders = [];
for (let i = 0; i < count; i++) {
	let name = faker.name.firstName();
	if (!leaders.find((l) => l.name === name)) {
	    leaders.push({
	        id: faker.random.number(),
	        name: name,
	    });
	}
}

leaders.sort((a, b) => a.name.localeCompare(b.name));

module.exports = {
	data: leaders
};