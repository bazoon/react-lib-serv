const environments = {
    staging: {
        port: 80,
        envName: 'Staging',
    },
    production: {
        port: 80,
        envName: 'Production',
    }
};

const currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

module.exports = environments[currentEnv];