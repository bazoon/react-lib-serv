const PORT = process.env.PORT || 3000
const http = require('http');
const url = require('url');
const config = require('./config');
const helpers = require('./helpers');
var StringDecoder = require('string_decoder').StringDecoder;

const projectsData = require('./api/projects');
const leadersData = require('./api/leaders');


const emptyProjectsData = {
    data: [],
    summary: [],
};

const router = {
    hello: {
        get: function (data, callback) {
            callback(200, {
                message: "Welcome!"
            });  
        }
    },
    projects: {
        get: function (data, callback) {
            

            
        },
        delete: function (data, callback) {
            const { id } = data.payload;
            
            if (id) {
                const project = projectsData.data.find((item) => item.id === id);
                const index = projectsData.data.indexOf(project);
                projectsData.data.splice(index, 1);
            }


            callback(200, projectsData);
        },
        list: function (data, callback) {
            let payload = projectsData.data.slice();


            const filterParams = data.payload && data.payload.filterParams;
            const sort = data.payload && data.payload.sortParams;
            const hasSort = Object.keys(sort).length > 0;
            const filterKeys = Object.keys(filterParams);
            
            const pageSize = data.payload.pageSize;
            const currentPage = data.payload.currentPage;



            const filters = filterKeys.reduce(function (acc, k) {
                acc.push({
                    field: k,
                    value: filterParams[k].value,
                    ordering: filterParams[k].ordering
                });
                return acc;
            }, []);


            if (filters && filters.length > 0) {

                filters.forEach((filter) => {
                    let field = filter.field;
                    let value = filter.value;
                    let ordering = filter.ordering;

                    
                    payload = payload.filter((item) => {
                        let fieldValue = item[field];

                        switch (true) {
                            case helpers.isNumeric(fieldValue):
                                return helpers.compareNumeric(fieldValue, value, ordering);
                            case helpers.isDate(fieldValue):
                                return helpers.compareDates(fieldValue, value, ordering);
                            default:
                                return helpers.compareStrings(fieldValue, value, ordering);
                        }
                    });
                });
            }

            if (hasSort) {
                payload.sort(sorter);
            }

            
            const total = payload.length;

            if (pageSize) {
                payload = payload.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
            }


            callback(200, {
                data: payload,
                total: total,
                summary: projectsData.summary
            });


            function sorter(a, b) {
                let item1 = a[sort.property];
                let item2 = b[sort.property];
                let r;
                
                switch(true) {
                    case helpers.isDate(item1):
                        r =  Date.parse(item1) - Date.parse(item2);
                        break;
                    case helpers.isNumeric(item1):
                        r = +item1 - +item2;
                        break;
                    default:
                        r = item1.localeCompare(item2);
                }

                if (sort.direction === "desc") {
                    r = r * (-1);
                }

                return r;

            }
        },
        sync: function (data, callback) {
            const items = data.payload.items;

            items.forEach((item) => {
                const project = projectsData.data.find((it) => item.id === it.id);
                const fields = Object.keys(item);

                fields.forEach(function (field) {
                   project[field] = item[field]; 
                });


            });

            callback(200, {});
        },
        post: function (data, callback) {
            const payload = data.payload;
            console.log(payload);

            if (payload.action === "list") {
                return router.projects.list(data, callback);
            } else if (payload.action === "sync") {
                return router.projects.sync(data, callback);
            }

            const project = projectsData.data.find((item) => item.id === payload.id);
            const keys = Object.keys(payload);
        
            keys.forEach((key) => {
                project[key] = payload[key];
            });

            callback(200, projectsData);
        },
        options: function (data, callback) {
            callback(200);
        }

    },
    leaders: {
        get: function (data, callback) {
            callback(200, leadersData);
        },
        post: function (data, callback) {
            if (data.payload.action === 'list') {
                router.leaders.get(data, callback);
            }
        }
    },
    notFound: function (data, callback) {
        callback(404);
    }
}

const server = http.createServer(function (req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/|\/+$/, '');
    const method = req.method.toLocaleLowerCase();

    
    var queryStringObject = parsedUrl.query;
    
    const routeHandler = findRouteFor(trimmedPath, method);
    
    

    const data = {};
    var decoder = new StringDecoder('utf-8');

    if (queryStringObject['sort[property]']) {
        data.sort = {
            property: queryStringObject['sort[property]'],
            direction: queryStringObject['sort[direction]']
        };
    }

    const keys = Object.keys(queryStringObject);

    

    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        data.payload = helpers.parseJsonToObject(buffer);

        
        routeHandler(data, function (statusCode, payload) {
            res.setHeader('Content-type', 'applications/json;charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
            

            res.writeHead(statusCode);
            res.end(JSON.stringify(payload));
        });
    });



    
    
});

server.listen(PORT, function () {
    console.log(`Listening on ${config.port} using ${config.envName} environment.`);
});


function findRouteFor(path, method) {
    const hasRoute = typeof(router[path]) === 'object';
    
    const hasMethod = typeof(router[path][method]) === 'function';
    
    if (hasMethod === false) {
        return router.notFound;
    }


    
    return router[path][method];
}

