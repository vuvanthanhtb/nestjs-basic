### Soft-delete plugin

#### Link: https://docs.nestjs.com/techniques/mongodb#plugins

#### Setup: `npm i --save-exact soft-delete-plugin-mongoose@1.0.15` & `https://github.com/nour-karoui/mongoose-soft-delete`

```
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => ({
    uri: config.get<string>('MONGO_DB_URL '),
      connectionFactory: (connection) => {
      connection.plugin(softDeletePlugin);
      return connection;
    }
  }),
}),
```

### Query Builder

#### npm i --save-exact api-query-params@5.4.0
