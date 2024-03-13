/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/strategy/:name', controller.strategy.index);
  router.get('/lucky', controller.home.index);
};
