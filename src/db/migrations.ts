import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // Add future migrations here
    // Example:
    // {
    //   toVersion: 2,
    //   steps: [
    //     createTable({
    //       name: 'new_table',
    //       columns: [
    //         { name: 'column_name', type: 'string' },
    //       ],
    //     }),
    //     addColumns({
    //       table: 'existing_table',
    //       columns: [
    //         { name: 'new_column', type: 'string' },
    //       ],
    //     }),
    //   ],
    // },
  ],
});