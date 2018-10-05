const environments = {
    staging: {
        port: 3000,
        envName: 'Staging',
    },
    production: {
        port: 5000,
        envName: 'Production',
    }
};

const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

module.exports = environments[currentEnv];