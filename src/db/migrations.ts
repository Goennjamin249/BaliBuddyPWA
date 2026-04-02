import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        {
          type: 'sql',
          sql: 'ALTER TABLE expenses RENAME COLUMN amount TO amount_idr',
        },
        addColumns({
          table: 'expenses',
          columns: [
            { name: 'category', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});