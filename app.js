const express = require('express');
const Sequelize = require('sequelize');
const graphqlHTTP = require('express-graphql');


const { 
    GraphQLSchema,
    GraphQLObjectType, 
    GraphQLInt,
    GraphQLString,
    GraphQLList
} = require('graphql');

const bodyParser = require('body-parser');
const port = 8000;

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

// MySQL

const connection = {
    database: 'graphqltest2',
    username: 'admin',
    password: 'TEtFbIs#1',
    host: 'localhost',
    dialect: 'mysql'
}

const sequelize = new Sequelize(
    connection.database,
    connection.username,
    connection.password, {
        host: connection.host,
        dialect: connection.dialect,
        logging: false
    },
);

const World = sequelize.define('world', {
    id: {
        type: 'Sequelize.INTEGER',
        primaryKey: true
    },
    randomNumber: {
        type: 'Sequelize.INTEGER'
    }
}, {
    timestamps: false,
    freezeTableName: true
});

const Fortune = sequelize.define('Fortune', {
    id: {
      type: 'Sequelize.INTEGER',
      primaryKey: true
    },
    message: {
      type: 'Sequelize.STRING'
    }
  }, {
      timestamps: false,
      freezeTableName: true
});

// GraphQL Schema

const RootQuery = new GraphQLObjectType({
    name: 'rootQuery',
    fields: () => ({
        world: worldQuery,
        fortune: fortuneQuery
    })
});

const WorldType = new GraphQLObjectType({
    name: 'World',
    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve: (world) => world.id,
        },
        randomNumber: {
            type: GraphQLInt,
            resolve: (world) => world.randomNumber
        }
    })
});

const FortuneType = new GraphQLObjectType({
    name: 'Fortune',
    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve: (fortune) => fortune.id
        },
        message: {
            type: GraphQLString,
            resolve: (fortune) => fortune.message
        }
    })
});

const worldQuery = {
    type: new GraphQLList(WorldType),
    args: {
        id: {
            name: 'id',
            type: GraphQLInt
        },
        randomNumber: {
            name: 'randomNumber',
            type: GraphQLInt
        }
    },
    resolve: (world, args) => World.findAll({ where: args })
};

const fortuneQuery = {
    type: new GraphQLList(FortuneType),
    args: {
        id: {
            name: 'id',
            type: GraphQLInt
        },
        message: {
            name: 'message',
            type: GraphQLString
        }
    }
};

const schema = new GraphQLSchema({
    query: RootQuery
});

var root = { hello: () => 'Hello world!' };

// Routes

// app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, cacheControl: true }));

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.get('/', (req, res) => {
    res.json({test: 'hola'});
});

app.listen(port, () => {
    console.log('listening on port ' + port);
});