// replicaset configuration
const config = {
    // same name as the argument given in initialization step
    _id: 'rs0',

    // single replica
    members: [
        {
            _id: 0,
            // hardcided db address
            host: 'localhost:27017',
        },
    ],
}

// apply the configuration
rs.initiate(config, {
    force: true,
})

// show status
rs.status()
