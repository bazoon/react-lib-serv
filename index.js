const PORT = process.env.PORT || 5000
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
            let payload = projectsData.data;
            const filterParams = data.payload && data.payload.filterParams;
            const sort = data.payload && payload.sortParams;
            const filterKeys = Object.keys(filterParams);

            const filters = filterKeys.reduce(function (acc, k) {
                acc.push({
                    field: k,
                    value: filterParams[k].value,
                    ordering: filterParams[k].ordering
                });
                return acc;
            }, []);

            console.log(JSON.stringify(filters))

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
                                console.log(fieldValue, value);
                                return helpers.compareStrings(fieldValue, value, ordering);
                        }

                        
                    });

                });
            }

            // if (data.sort) {
            //     payload.sort(sorter);
            // }



            callback(200, {
                data: payload,
                summary: projectsData.summary
            });


            function sorter(a, b) {
                let item1 = a[data.sort.property];
                let item2 = b[data.sort.property];
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

                if (data.sort.direction === "desc") {
                    r = r * (-1);
                }

                return r;

            }
        },
        post: function (data, callback) {
            const payload = data.payload;
            
            if (payload.action === "list") {
                return router.projects.list(data, callback);
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

    // console.log(queryStringObject)
    // const filterKeys = keys.filter((k) => k.indexOf('filter[') !== -1);

    // const filters = filterKeys.map((k) => {
    //     let startIndex = k.indexOf('[');
    //     let endIndex = k.indexOf(']');
    //     let field = k.slice(startIndex + 1, endIndex);

    //     return {
    //         field: field,
    //         value: queryStringObject[k]
    //     }
    // });

    // data.filters = filters;
    // console.log(data.filters)
    

    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        data.payload = helpers.parseJsonToObject(buffer);

        
        routeHandler(data, function (statusCode, payload) {
            res.setHeader('Content-type', 'applications/json');
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

