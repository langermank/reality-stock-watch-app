// script to generate the drop tables for development using the initial structure setup

const fs = require('fs').promises;

const migrationPath = './app-domain/data-layer/migrations/000-initial-db-structure.sql';

(async () => {
  const content = (await fs.readFile(migrationPath)).toString();

  const tableRegex = /create table if not exists (?<schema>"[\w]+").(?<table>"[\w]+")/g;

  const groups = [];
  for (const match of content.matchAll(tableRegex)) {
    groups.unshift(match.groups);
  }

  for (const group of groups) {
    console.log(`drop table if exists ${group.schema}.${group.table};`);
  }

  process.exit(0);
})();
