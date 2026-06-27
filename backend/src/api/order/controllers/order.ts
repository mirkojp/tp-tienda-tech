import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Debe iniciar sesión para crear una orden.');
    }

    // Asegurar que request.body.data exista
    if (!ctx.request.body.data) {
      ctx.request.body.data = {};
    }

    // Asociar la orden al usuario autenticado
    ctx.request.body.data.user = user.id;

    // Llamar al método por defecto para guardar la orden
    const response = await super.create(ctx);
    return response;
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Debe iniciar sesión para ver sus órdenes.');
    }

    // Filtrar para que sólo retorne las órdenes asociadas al usuario actual
    ctx.query.filters = {
      ...(ctx.query.filters as any),
      user: {
        id: user.id
      }
    };

    const response = await super.find(ctx);
    return response;
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Debe iniciar sesión.');
    }

    // Buscar la orden para chequear pertenencia
    const order: any = await (strapi.documents('api::order.order') as any).findOne({
      documentId: id,
      populate: ['user']
    });

    if (!order) {
      return ctx.notFound('Orden no encontrada.');
    }

    // Si la orden tiene un usuario y no coincide con el actual, retornar no autorizado
    if (order.user && order.user.id !== user.id) {
      return ctx.unauthorized('No tiene permiso para ver esta orden.');
    }

    const response = await super.findOne(ctx);
    return response;
  }
}));
