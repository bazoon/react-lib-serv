const faker = require('faker');
const leaders = require('./leaders');


const count = 700;
const items = [];

function getLeader() {
    return leaders.data[Math.floor(Math.random() * leaders.data.length)];
}


for (let i = 0; i < count; i++ ) {
    items.push({
        id: faker.random.uuid(),
        code: faker.finance.account(),
        name: faker.finance.accountName(),
        leader: getLeader().name,
        price: faker.random.number(),
        price2: faker.random.number(),
        some: faker.lorem.words(200),
        startDate: faker.date.future(),
        // some1: faker.lorem.words(10),
        // some2: faker.lorem.words(20)
    });
}

const summaryItems = [
    {
        code: '',
        name: 'Итого:',
        leader: '',
        price: 10000,
        price2: '',
        some: '',
        startDate: '',
        some1: '',
        some2: ''
    }
];

module.exports = {
    data: items,
    summary: summaryItems
};