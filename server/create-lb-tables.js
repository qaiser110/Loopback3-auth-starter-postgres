const server = require('./server')
const ds = server.dataSources.pgDS
const lbTables = ['Member', 'AccessToken', 'ACL', 'RoleMapping', 'Role']

ds.automigrate(lbTables, er => {
  if (er) throw er
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name)
  return ds.disconnect()
})
