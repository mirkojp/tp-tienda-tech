// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    console.log('[BOOTSTRAP] Checking Users-Permissions plugin permissions for relation filtering...');
    const knex = strapi.db.connection;

    try {
      // 1. Verify necessary tables exist
      const hasPermissionsTable = await knex.schema.hasTable('up_permissions');
      const hasRolesTable = await knex.schema.hasTable('up_roles');
      const hasLinksTable = await knex.schema.hasTable('up_permissions_role_lnk');

      if (!hasPermissionsTable || !hasRolesTable || !hasLinksTable) {
        console.log('[BOOTSTRAP] Users-Permissions tables do not exist yet. Skipping permissions sync.');
        return;
      }

      // Actions we want to grant
      const actions = [
        'plugin::users-permissions.user.find',
        'plugin::users-permissions.user.findOne'
      ];

      // Roles we want to grant them to: Authenticated (type: 'authenticated') and Public (type: 'public')
      const roles = await knex('up_roles').select('id', 'type');
      const authRole = roles.find((r: any) => r.type === 'authenticated');
      const publicRole = roles.find((r: any) => r.type === 'public');

      if (!authRole || !publicRole) {
        console.log('[BOOTSTRAP] Could not find authenticated or public role. Skipping.');
        return;
      }

      const crypto = require('crypto');

      for (const action of actions) {
        // Find or create permission record in up_permissions
        let permission = await knex('up_permissions').where({ action }).first();
        if (!permission) {
          console.log(`[BOOTSTRAP] Creating permission record for action: ${action}`);
          const now = Date.now();
          const docId = crypto.randomBytes(12).toString('hex');
          
          const [insertedId] = await knex('up_permissions').insert({
            document_id: docId,
            action,
            created_at: now,
            updated_at: now,
            published_at: now
          });
          
          permission = { id: insertedId, action };
        }

        // Link to Authenticated role (1)
        const authLink = await knex('up_permissions_role_lnk')
          .where({ permission_id: permission.id, role_id: authRole.id })
          .first();
        if (!authLink) {
          console.log(`[BOOTSTRAP] Linking action "${action}" to Authenticated role...`);
          const maxOrdRes = await knex('up_permissions_role_lnk')
            .where({ role_id: authRole.id })
            .max('permission_ord as maxOrd')
            .first();
          const nextOrd = ((maxOrdRes as any)?.maxOrd || 0) + 1;

          await knex('up_permissions_role_lnk').insert({
            permission_id: permission.id,
            role_id: authRole.id,
            permission_ord: nextOrd
          });
        }

        // Link to Public role (2)
        const publicLink = await knex('up_permissions_role_lnk')
          .where({ permission_id: permission.id, role_id: publicRole.id })
          .first();
        if (!publicLink) {
          console.log(`[BOOTSTRAP] Linking action "${action}" to Public role...`);
          const maxOrdRes = await knex('up_permissions_role_lnk')
            .where({ role_id: publicRole.id })
            .max('permission_ord as maxOrd')
            .first();
          const nextOrd = ((maxOrdRes as any)?.maxOrd || 0) + 1;

          await knex('up_permissions_role_lnk').insert({
            permission_id: permission.id,
            role_id: publicRole.id,
            permission_ord: nextOrd
          });
        }
      }
      console.log('[BOOTSTRAP] Users-Permissions check completed successfully.');
    } catch (err) {
      console.error('[BOOTSTRAP] Error setting up user permissions:', err);
    }
  },
};

