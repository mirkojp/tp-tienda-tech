import { errors } from '@strapi/utils';

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (!data.items || !Array.isArray(data.items)) return;

    for (const item of data.items) {
      if (!item.documentId) {
        throw new errors.ApplicationError("Cada ítem del carrito debe tener un documentId válido.");
      }

      // Buscar el producto en la base de datos
      const product = await strapi.documents('api::product.product').findOne({
        documentId: item.documentId,
        status: 'published',
      });

      if (!product) {
        throw new errors.ApplicationError(`El producto "${item.title || item.documentId}" no existe.`);
      }

      // Validar stock
      if (product.stock < item.quantity) {
        throw new errors.ApplicationError(
          `Stock insuficiente para el producto "${product.title}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;
    const items = result.items;
    if (!items || !Array.isArray(items)) return;

    for (const item of items) {
      if (!item.documentId) continue;

      try {
        // Buscar el producto para obtener su stock actualizado
        const product = await strapi.documents('api::product.product').findOne({
          documentId: item.documentId,
          status: 'published',
        });

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await strapi.documents('api::product.product').update({
            documentId: item.documentId,
            data: {
              stock: newStock,
            },
            status: 'published',
          });
          console.log(`[STOCK] Reducido stock de "${product.title}" de ${product.stock} a ${newStock}`);
        }
      } catch (error) {
        console.error(`[STOCK] Error al actualizar stock para el producto ${item.documentId}:`, error);
      }
    }
  }
};
