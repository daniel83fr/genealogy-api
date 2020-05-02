import { Request, Response } from "express";

import {
  getPersonById, createPerson, deletePersonById, updatePerson, getPersonRelations,
  unlinkRelations, linkSpouseRelations, updateRelation, getPersonByIdFull,
  getUnusedPersons
} from "../services/search/PersonController";

const querystring = require('querystring');
const root = "/api/v1/"


export function getPersonHandler(req: Request, res: Response) {
  var personId = req.params.personId;
  getPersonById(personId)
    .then(data =>
      res.status(200).send(data));
}

export function putPersonHandler(req: Request, res: Response) {
  var usr = Object.assign(req.body);
  usr._id = null;
  if ((!usr.FirstName || usr.FirstName == "") && (!usr.LastName || usr.LastName == "")) {
    res.status(400).send(`firstname (${usr.FirstName}) or lastname (${usr.LastName}) should be defined`);
  }
  else {
    createPerson(usr, root).then(data => {
      console.log(data);
      res.status(201).send(data);
    });

  }
}

export function deletePersonHandler(req: Request, res: Response) {
  deletePersonById(req.params.personId).then(data =>
    res.status(200).send(data));
}

export function patchPersonHandler(req: Request, res: Response) {
  var usr = Object.assign(req.body);

  const result = updatePerson(req.params.personId, req.body)
    .then(data => {
      console.log(result);
      res.status(201).send(result);
    });

}

export function getPersonFullHandler(req: Request, res: Response) {
  getPersonByIdFull(req.params.personId)
    .then(data => res.status(200).send(data));
}

export function getPersonRelationsHandler(req: Request, res: Response) {
  getPersonRelations(req.params.personId)
  .then(result => res.status(200).send(result));
}

export function deleteRelationHandler(req: Request, res: Response) {
  unlinkRelations(req.params.personId, req.params.personId2).then(result=>
    {
      console.log(result);
      res.status(200).send(result);
    });
  
}


export function patchRelationHandler(req: Request, res: Response) {
  var usr = Object.assign(req.body);

  updateRelation(req.params.personId, req.params.personId2, req.body)
  .then(result=>{
    console.log(result);
    res.status(201).send(result);
  });
  
}


export function linkSpouseHandler(req: Request, res: Response) {
  linkSpouseRelations(req.params.personId, req.params.personId2)
  .then(result=>
  res.status(200).send(result));
}

export function getUnlinkedPersonsHandler(req: Request, res: Response) {
  getUnusedPersons().then(result=>
  res.status(200).send(result));
}
