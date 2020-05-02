import { Router, Request, Response, NextFunction } from "express";
import { renderIndex as renderIndexHandler } from "../routes/mainRoute";
import { 
  getPersonHandler, 
  putPersonHandler, 
  deletePersonHandler, 
  patchPersonHandler, 
  getPersonFullHandler, 
  getPersonRelationsHandler,
  deleteRelationHandler,
  linkParentHandler, 
  linkChildHandler, 
  linkSpouseHandler, 
  getUnlinkedPersonsHandler,
  patchRelationHandler } from "../routes/apiRoutes";

type Wrapper = ((router: Router) => void);

export const applyMiddleware = (
  middlewareWrappers: Wrapper[],
  router: Router
) => {
  for (const wrapper of middlewareWrappers) {
    wrapper(router);
  }
};


const root = "/api/v1/"

export const applyRoutes = (router: Router) => {

  router
    .route('/')
    .get(renderIndexHandler)

  router
    .route(`${root}person`)
    .put(putPersonHandler)

  router
    .route(`${root}person/:personId`)
    .get(getPersonHandler)
    .delete(deletePersonHandler)
    .patch(patchPersonHandler)

  router
    .route(`${root}person/:personId/full`)
    .get(getPersonFullHandler)

  router
    .route(`${root}person/:personId/relations`)
    .get(getPersonRelationsHandler)


  router
    .route(`${root}person/:personId/relation/:personId2`)
    .delete(deleteRelationHandler)
    .patch(patchRelationHandler)

  router
    .route(`${root}person/:personId/parent/:personId2`)
    .put(linkParentHandler)


  router
    .route(`${root}person/:personId/child/:personId2`)
    .put(linkChildHandler)

  router
    .route(`${root}person/:personId/spouse/:personId2`)
    .put(linkSpouseHandler)

  router
    .route(`${root}admin/person/unused`)
    .put(getUnlinkedPersonsHandler)

};