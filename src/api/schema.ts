import { GraphQLList, GraphQLString } from "graphql";

var graphql = require('graphql');

var fakeDatabase = {
    'a': {
      _id: 'a',
      FirstName: 'alice',
      LastName: 'aaa'
    },
    'b': {
      _id: 'b',
      FirstName: 'bob',
      LastName: 'bbb'
    },
  };

// Define the User type
var userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
      _id: { type: graphql.GraphQLString },
    FirstName: { type: graphql.GraphQLString },
    LastName: { type: graphql.GraphQLString },
    }
  });
  
  // Define the Query type
  var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {

      hello: {
        type: graphql.GraphQLString
      },

      getPersons:{
        type:  new GraphQLList(userType)
      },

      getPerson: {
        type:  new GraphQLList(userType),
        // `args` describes the arguments that the `user` query accepts
        args: {
          _id: { type: graphql.GraphQLString }
        },
        resolve: (_: any, id: { id: string}) => {
          
          let items = []
          items.push(fakeDatabase.a)
          items.push(fakeDatabase.b)
          return items;
        }
      }
    }
  });
  
  var schema = new graphql.GraphQLSchema({query: queryType});
export default schema